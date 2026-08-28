import { RestaurantSettings } from "@/types";

export const defaultRestaurantSettings: RestaurantSettings = {
  name: "DineFlow Kitchen",
  phone: "+880 1711-000111",
  email: "hello@dineflow.example",
  address: "House 7, Road 12, Gulshan 1, Dhaka 1212",
  currency: "BDT",
  deliveryFee: 60,
  minimumOrder: 200,
  openingHours: [
    { day: "Monday", isOpen: true, open: "10:00", close: "22:00" },
    { day: "Tuesday", isOpen: true, open: "10:00", close: "22:00" },
    { day: "Wednesday", isOpen: true, open: "10:00", close: "22:00" },
    { day: "Thursday", isOpen: true, open: "10:00", close: "22:00" },
    { day: "Friday", isOpen: true, open: "14:00", close: "23:00" },
    { day: "Saturday", isOpen: true, open: "10:00", close: "23:00" },
    { day: "Sunday", isOpen: true, open: "10:00", close: "22:00" },
  ],
};
