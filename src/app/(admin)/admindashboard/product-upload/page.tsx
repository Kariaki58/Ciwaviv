"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus, Trash2, Loader2 } from "lucide-react";

// Dynamic schema based on your Mongoose models
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  inventory: z.number().min(0, "Inventory cannot be negative"),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  variants: z.array(z.object({
    type: z.string().min(1, "Variant type is required"),
    name: z.string().min(1, "Variant name is required"),
    value: z.string().min(1, "Variant value is required"),
    priceAdjustment: z.number().default(0),
    inventory: z.number().min(0).default(0),
  })),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Common variant types - can be extended dynamically
const commonVariantTypes = [
  "size",
  "color", 
  "weight",
  "material",
  "style",
  "dimension",
  "capacity",
  "edition",
  "version"
];

export default function ProductUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<{ src: string; alt: string; aiHint?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVariantType, setNewVariantType] = useState("");
  const [newVariantValue, setNewVariantValue] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      category: "",
      inventory: 0,
      isActive: true,
      featured: false,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        const slug = value.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setValue("slug", slug);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.urls) {
        const newImages = result.urls.map((url: string) => ({
          src: url,
          alt: form.getValues("name") || "Product image",
          aiHint: "",
        }));
        setUploadedImages(prev => [...prev, ...newImages]);
      } else {
        console.error("Upload failed:", result.errors);
        alert("Image upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (newVariantType && newVariantValue) {
      append({
        type: newVariantType,
        name: newVariantValue,
        value: newVariantValue,
        priceAdjustment: 0,
        inventory: 0,
      });
      setNewVariantValue("");
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const productData = {
        ...data,
        images: uploadedImages,
        // Transform variants into the format your backend expects
        sizes: data.variants.filter(v => v.type === 'size').map(v => v.value),
        colors: data.variants.filter(v => v.type === 'color').map(v => v.value),
        // Add other variant types as needed
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert('Product created successfully!');
        form.reset();
        setUploadedImages([]);
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    }
  };

  // Group variants by type for better display
  const groupedVariants = fields.reduce((acc, variant, index) => {
    if (!acc[variant.type]) {
      acc[variant.type] = [];
    }
    acc[variant.type].push({ ...variant, index });
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    Enter the basic information about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="product-slug" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be used in the product URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inventory</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Product will be visible to customers
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured</FormLabel>
                            <FormDescription>
                              Show this product as featured
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Add different variants like size, color, weight, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Variant */}
                  <div className="flex flex-col sm:flex-row gap-2 p-4 border rounded-lg">
                    <Select value={newVariantType} onValueChange={setNewVariantType}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonVariantTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Variant value (e.g., Red, Large, 1kg)"
                      value={newVariantValue}
                      onChange={(e) => setNewVariantValue(e.target.value)}
                      className="flex-1"
                    />

                    <Button type="button" onClick={addVariant} disabled={!newVariantType || !newVariantValue}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Display Grouped Variants */}
                  {Object.keys(groupedVariants).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedVariants).map(([type, variants]) => (
                        <div key={type} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold capitalize">{type}</h4>
                            <Badge variant="secondary">{variants.length} variants</Badge>
                          </div>
                          <div className="grid gap-2">
                            {variants.map(({ id, name, value, priceAdjustment, inventory, index }) => (
                              <div key={id} className="flex items-center gap-2 p-2 border rounded">
                                <div className="flex-1">
                                  <span className="font-medium">{value}</span>
                                  {priceAdjustment !== 0 && (
                                    <span className={`text-sm ml-2 ${priceAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      ({priceAdjustment > 0 ? '+' : ''}${priceAdjustment})
                                    </span>
                                  )}
                                  {inventory > 0 && (
                                    <span className="text-sm ml-2 text-gray-600">
                                      Stock: {inventory}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No variants added yet. Add your first variant above.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload product images. You can upload multiple images at once.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Drag and drop images here, or click to select
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG, WEBP up to 10MB each
                      </p>
                    </label>
                  </div>

                  {isUploading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Uploading images...</span>
                    </div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Product
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}