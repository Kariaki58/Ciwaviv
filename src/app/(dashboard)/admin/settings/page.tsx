"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Country, State, City } from "country-state-city";

interface ShippingPrice {
  country: string;
  state: string;
  city: string;
  price: number;
}

export default function Settings() {
  const [shippingPrices, setShippingPrices] = useState<ShippingPrice[]>([]);
  const [flatShippingFee, setFlatShippingFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Location states
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  // Selected locations
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  // Load countries
  useEffect(() => {
    const countryData = Country.getAllCountries();
    setCountries(countryData);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const stateData = State.getStatesOfCountry(selectedCountry);
      setStates(stateData);
      setSelectedState("");
      setSelectedCity("");
      setCities([]);
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const cityData = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(cityData);
      setSelectedCity("");
    }
  }, [selectedCountry, selectedState]);

  const fetchShippingSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipping');
      if (response.ok) {
        const data = await response.json();
        setShippingPrices(data.prices || []);
        setFlatShippingFee(data.flatFee || 0);
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addShippingPrice = () => {
    if (!selectedCountry || !selectedState || !selectedCity || !price) {
      alert("Please fill all fields");
      return;
    }

    const countryName = countries.find(c => c.isoCode === selectedCountry)?.name || selectedCountry;
    const stateName = states.find(s => s.isoCode === selectedState)?.name || selectedState;
    const cityName = cities.find(c => c.name === selectedCity)?.name || selectedCity;

    const newPrice: ShippingPrice = {
      country: countryName,
      state: stateName,
      city: cityName,
      price: parseFloat(price)
    };

    setShippingPrices(prev => [...prev, newPrice]);
    
    // Reset form
    setSelectedCity("");
    setPrice("");
  };

  const removeShippingPrice = (index: number) => {
    setShippingPrices(prev => prev.filter((_, i) => i !== index));
  };

  const saveShippingSettings = async () => {
    setSaveLoading(true);
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prices: shippingPrices,
          flatFee: flatShippingFee 
        }),
      });

      if (response.ok) {
        alert('Shipping settings updated successfully!');
      } else {
        throw new Error('Failed to save shipping settings');
      }
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      alert('Error saving shipping settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-100">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-700 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Shipping Settings</h1>
          <p className="mt-2 text-sm text-gray-100">
            Manage shipping prices by location
          </p>
        </div>

        {/* Flat Shipping Fee Section */}
        <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Flat Shipping Fee</h2>
            <p className="text-gray-300 mb-4">
                This fee will be applied to all locations that don't have specific shipping prices set.
            </p>
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-100 mb-2">
                    Flat Fee (₦)
                </label>
                <input
                    type="number"
                    value={flatShippingFee}
                    onChange={(e) => setFlatShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                />
                </div>
                <div className="flex space-x-2">
                <button
                    onClick={() => setFlatShippingFee(1000)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    ₦1000
                </button>
                <button
                    onClick={() => setFlatShippingFee(2000)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    ₦2000
                </button>
                <button
                    onClick={() => setFlatShippingFee(3000)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    ₦3000
                </button>
                </div>
                <button
                onClick={saveShippingSettings}
                disabled={saveLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                {saveLoading ? 'Saving...' : 'Save Flat Fee'}
                </button>
            </div>
        </div>

        {/* Add Shipping Price Form */}
        <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Add Specific Shipping Price</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Country Select */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Select */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled={!selectedCountry}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Select */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Price (₦)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <button
            onClick={addShippingPrice}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Shipping Price
          </button>
        </div>

        {/* Shipping Prices List */}
        <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-100">
              Specific Shipping Prices ({shippingPrices.length})
            </h2>
            <button
              onClick={saveShippingSettings}
              disabled={saveLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saveLoading ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>

          {shippingPrices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No specific shipping prices configured. The flat fee will be used for all locations.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {shippingPrices.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {item.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {item.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {item.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        ₦{item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => removeShippingPrice(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Account Settings</h2>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}