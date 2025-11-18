// app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Settings,
  Truck,
  Plus,
  Trash2,
  Globe,
  MapPin,
  Building,
  Loader2,
  Save,
} from "lucide-react";
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

interface ShippingPrice {
  _id?: string;
  country: string;
  state: string;
  city: string;
  price: number;
  type: 'specific' | 'flat';
}

interface ShippingSettings {
  prices: ShippingPrice[];
  flatFee: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
  const [flatFee, setFlatFee] = useState("0");
  const [specificPrices, setSpecificPrices] = useState<ShippingPrice[]>([]);

  // Fetch current shipping settings
  const { data: settingsData, error, mutate } = useSWR<{ success: boolean; prices: ShippingPrice[]; flatFee: number }>(
    session ? "/api/shipping" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (settingsData?.success) {
      setSpecificPrices(settingsData.prices || []);
      setFlatFee(settingsData.flatFee?.toString() || "0");
    }
  }, [settingsData]);

  const countries = Country.getAllCountries();
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
  const cities = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : [];

  const handleAddSpecificPrice = () => {
    if (!selectedCountry || !selectedState || !selectedCity || !shippingPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(shippingPrice);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid shipping price",
        variant: "destructive",
      });
      return;
    }

    const country = countries.find(c => c.isoCode === selectedCountry);
    const state = states.find(s => s.isoCode === selectedState);
    const city = cities.find(c => c.name === selectedCity);

    if (!country || !state || !city) {
      toast({
        title: "Error",
        description: "Invalid location selected",
        variant: "destructive",
      });
      return;
    }

    const newPrice: ShippingPrice = {
      country: country.name,
      state: state.name,
      city: city.name,
      price: price,
      type: 'specific'
    };

    // Check if this location already has a price
    const existingIndex = specificPrices.findIndex(
      price => price.country === country.name && price.state === state.name && price.city === city.name
    );

    if (existingIndex >= 0) {
      // Update existing price
      const updatedPrices = [...specificPrices];
      updatedPrices[existingIndex] = newPrice;
      setSpecificPrices(updatedPrices);
    } else {
      // Add new price
      setSpecificPrices([...specificPrices, newPrice]);
    }

    // Reset form
    setShippingPrice("");
    setSelectedCity("");
  };

  const handleRemoveSpecificPrice = (index: number) => {
    const newPrices = [...specificPrices];
    newPrices.splice(index, 1);
    setSpecificPrices(newPrices);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const flatFeeValue = parseFloat(flatFee);
      if (isNaN(flatFeeValue) || flatFeeValue < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid flat fee",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prices: specificPrices,
          flatFee: flatFeeValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        mutate(); // Refresh the data
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getLocationDisplayName = (price: ShippingPrice) => {
    return `${price.city}, ${price.state}, ${price.country}`;
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Shipping Settings</h1>
          <p className="text-gray-500">Configure shipping rates and delivery options</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flat Shipping Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Flat Shipping Rate
            </CardTitle>
            <CardDescription>
              Set a standard shipping fee that applies to all locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flatFee">Flat Shipping Fee (₦)</Label>
              <Input
                id="flatFee"
                type="number"
                min="0"
                step="0.01"
                value={flatFee}
                onChange={(e) => setFlatFee(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500">
                This rate will be used when no specific location pricing is found
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Specific Location Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location-Specific Pricing
            </CardTitle>
            <CardDescription>
              Set different shipping rates for specific cities and states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Selection Form */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Country
                  </Label>
                  <Select value={selectedCountry} onValueChange={(value) => {
                    setSelectedCountry(value);
                    setSelectedState("");
                    setSelectedCity("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      State
                    </Label>
                    <Select 
                      value={selectedState} 
                      onValueChange={(value) => {
                        setSelectedState(value);
                        setSelectedCity("");
                      }}
                      disabled={!selectedCountry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedState && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      City
                    </Label>
                    <Select 
                      value={selectedCity} 
                      onValueChange={setSelectedCity}
                      disabled={!selectedState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedCity && (
                  <div className="space-y-2">
                    <Label>Shipping Price (₦)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingPrice}
                      onChange={(e) => setShippingPrice(e.target.value)}
                      placeholder="Enter shipping price"
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleAddSpecificPrice}
                disabled={!selectedCity || !shippingPrice}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Location Price
              </Button>
            </div>

            {/* Current Specific Prices */}
            <div className="space-y-3">
              <Label>Current Location Prices</Label>
              {specificPrices.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No location-specific prices set</p>
                  <p className="text-sm">Add prices for specific cities and states</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {specificPrices.map((price, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {getLocationDisplayName(price)}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          ₦{price.price.toLocaleString()}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpecificPrice(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
          <CardDescription>
            Overview of your current shipping configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {specificPrices.length}
              </div>
              <div className="text-sm text-gray-600">Location Prices</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₦{parseFloat(flatFee || "0").toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Flat Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(specificPrices.map(p => p.country))].length}
              </div>
              <div className="text-sm text-gray-600">Countries Covered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          size="lg"
          className="min-w-[200px]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Shipping Settings
            </>
          )}
        </Button>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Shipping Pricing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <strong>Specific Location Pricing</strong>
                <p className="text-gray-600">
                  When a customer enters their address, we first check for an exact match of their city, state, and country.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <strong>Fallback to Flat Rate</strong>
                <p className="text-gray-600">
                  If no specific price is found for their location, the flat shipping rate will be applied.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <strong>Free Shipping Option</strong>
                <p className="text-gray-600">
                  Set the flat rate to 0 for free shipping, or set specific locations to 0 for free shipping in those areas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}