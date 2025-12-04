import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (components: AddressComponents) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

// Declare google namespace for TypeScript
declare const google: {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options?: {
          types?: string[];
          componentRestrictions?: { country: string };
          fields?: string[];
        }
      ) => {
        addListener: (event: string, callback: () => void) => void;
        getPlace: () => {
          address_components?: Array<{
            long_name: string;
            short_name: string;
            types: string[];
          }>;
          formatted_address?: string;
          types?: string[];
        };
      };
    };
    event: {
      clearInstanceListeners: (instance: unknown) => void;
    };
  };
};

// Load Google Maps script dynamically
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== "undefined" && (window as { google?: typeof google }).google?.maps?.places) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("Google Maps API key not configured"));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
};

export const AddressAutocomplete = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  className,
  id = "streetAddress",
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleAddressSelect = useCallback((components: AddressComponents) => {
    onAddressSelect(components);
  }, [onAddressSelect]);

  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsLoaded(true))
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["address_components", "formatted_address", "types"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      // Parse address components
      let streetNumber = "";
      let route = "";
      let city = "";
      let state = "";
      let zipCode = "";

      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (types.includes("route")) {
          route = component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.short_name;
        }
        if (types.includes("postal_code")) {
          zipCode = component.long_name;
        }
      }

      const streetAddress = streetNumber ? `${streetNumber} ${route}` : route;

      // Check for P.O. Box (reject these)
      const isPoBox = place.types?.includes("post_box") || 
                      streetAddress.toLowerCase().includes("p.o. box") ||
                      streetAddress.toLowerCase().includes("po box");

      if (isPoBox) {
        handleChange("");
        handleAddressSelect({ streetAddress: "", city: "", state: "", zipCode: "" });
        return;
      }

      handleChange(streetAddress);
      handleAddressSelect({
        streetAddress,
        city,
        state,
        zipCode,
      });
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, handleChange, handleAddressSelect]);

  // Handle manual typing
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value);
  };

  if (loadError) {
    // Fallback to regular input if Google Maps fails to load
    return (
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onInputChange}
        className={cn("w-full", className)}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      placeholder={isLoaded ? placeholder : "Loading address search..."}
      value={value}
      onChange={onInputChange}
      className={cn("w-full", className)}
      disabled={!isLoaded && !loadError}
    />
  );
};
