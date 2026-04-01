export const T = {
  brown: "#412402",
  brownLight: "#6B3A0A",
  gold: "#EF9F27",
  goldLight: "#FAC775",
  goldPale: "#FAEEDA",
  cream: "#FFFDF5",
  white: "#FFFFFF",
  textDark: "#2C1A00",
  textMid: "#854F0B",
  textLight: "#633806",
  border: "#FAC775",
  red: "#C0392B",
  green: "#2E7D32",
};

export const CATEGORIES = [
  { id: "desi", label: "Desi", emoji: "🍛" },
  { id: "bbq", label: "Bar.B.Q", emoji: "🍢" },
  { id: "karahi", label: "Karahi", emoji: "🥘" },
  { id: "handi", label: "Handi", emoji: "🫕" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "chaat", label: "Chaat", emoji: "🥗" },
  { id: "burger", label: "Burger", emoji: "🍔" },
  { id: "fries", label: "Fries", emoji: "🍟" },
  { id: "salad", label: "Salad", emoji: "🥙" },
  { id: "soup", label: "Soup", emoji: "🍲" },
  { id: "hotcold", label: "Hot & Cold", emoji: "☕" },
  { id: "tandoor", label: "Tandoor", emoji: "🫓" },
];

export const MENU = [
  // Desi
  { id: "d1", cat: "desi", name: "Chicken Qorma", price: 550 },
  { id: "d2", cat: "desi", name: "Special Daal", price: 449 },
  { id: "d3", cat: "desi", name: "Mix Vegetable", price: 350 },
  { id: "d4", cat: "desi", name: "Beef Qeema", price: 450 },
  { id: "d5", cat: "desi", name: "Chicken Biryani", price: 399 },
  { id: "d6", cat: "desi", name: "Beef Kabli Pulao", price: 549 },
  { id: "d7", cat: "desi", name: "Daal Chawal", price: 399 },
  // BBQ
  { id: "b1", cat: "bbq", name: "Chicken Seekh Kebab 4pc", price: 999 },
  { id: "b2", cat: "bbq", name: "Tikka Boti 10pc", price: 1049 },
  { id: "b3", cat: "bbq", name: "Malai Boti 10pc", price: 1299 },
  { id: "b4", cat: "bbq", name: "Beef Kebab 4pc", price: 1049 },
  { id: "b5", cat: "bbq", name: "Chicken Leg", price: 399 },
  { id: "b6", cat: "bbq", name: "Chicken Breast", price: 449 },
  // Karahi
  {
    id: "k1",
    cat: "karahi",
    name: "Chicken Karahi",
    hasVariants: true,
    variants: [
      { label: "Half", price: 1049 },
      { label: "Full", price: 1799 },
    ],
  },
  {
    id: "k2",
    cat: "karahi",
    name: "Chicken White Karahi",
    hasVariants: true,
    variants: [
      { label: "Half", price: 1049 },
      { label: "Full", price: 1799 },
    ],
  },
  {
    id: "k3",
    cat: "karahi",
    name: "Chicken Nawabi Karahi",
    hasVariants: true,
    variants: [
      { label: "Half", price: 1049 },
      { label: "Full", price: 1799 },
    ],
  },
  {
    id: "k4",
    cat: "karahi",
    name: "Chicken Shinwari Karahi",
    hasVariants: true,
    variants: [
      { label: "Half", price: 1049 },
      { label: "Full", price: 1799 },
    ],
  },
  // Handi
  { id: "h1", cat: "handi", name: "Chicken Makhni", price: 1549 },
  { id: "h2", cat: "handi", name: "Chicken Jalfrezi", price: 1549 },
  { id: "h3", cat: "handi", name: "Chicken Achari", price: 1549 },
  { id: "h4", cat: "handi", name: "Chicken Ginger", price: 1549 },
  // Pizza
  {
    id: "p1",
    cat: "pizza",
    name: "Fajita Pizza",
    hasVariants: true,
    variants: [
      { label: "Small", price: 749 },
      { label: "Medium", price: 1199 },
      { label: "Large", price: 1599 },
    ],
  },
  {
    id: "p2",
    cat: "pizza",
    name: "Tikka Pizza",
    hasVariants: true,
    variants: [
      { label: "Small", price: 749 },
      { label: "Medium", price: 1199 },
      { label: "Large", price: 1599 },
    ],
  },
  {
    id: "p3",
    cat: "pizza",
    name: "Grilled Pizza",
    hasVariants: true,
    variants: [
      { label: "Small", price: 749 },
      { label: "Medium", price: 1199 },
      { label: "Large", price: 1599 },
    ],
  },
  {
    id: "p4",
    cat: "pizza",
    name: "Crown Crust Pizza",
    hasVariants: true,
    variants: [
      { label: "Small", price: 849 },
      { label: "Medium", price: 1299 },
      { label: "Large", price: 1699 },
    ],
  },
  {
    id: "p5",
    cat: "pizza",
    name: "Peri Peri Pizza",
    hasVariants: true,
    variants: [
      { label: "Small", price: 849 },
      { label: "Medium", price: 1299 },
      { label: "Large", price: 1699 },
    ],
  },
  { id: "p6", cat: "pizza", name: "Mini Pizza", price: 500 },
  // Chaat
  { id: "c1", cat: "chaat", name: "Fruit Chaat", price: 249 },
  { id: "c2", cat: "chaat", name: "Chana Chaat", price: 179 },
  { id: "c3", cat: "chaat", name: "Cream Chaat", price: 249 },
  { id: "c4", cat: "chaat", name: "Samosa Chaat", price: 199 },
  // Burger
  { id: "u1", cat: "burger", name: "Chicken Burger", price: 549 },
  { id: "u2", cat: "burger", name: "Fried Chicken Burger", price: 549 },
  { id: "u3", cat: "burger", name: "Club Sandwich", price: 549 },
  { id: "u4", cat: "burger", name: "Grilled Chicken Burger", price: 549 },
  { id: "u5", cat: "burger", name: "Bar.B.Q Burger", price: 549 },
  { id: "u6", cat: "burger", name: "Spicy Grilled Burger", price: 549 },
  // Fries
  { id: "f1", cat: "fries", name: "French Fries", price: 299 },
  { id: "f2", cat: "fries", name: "Pizza Fries", price: 449 },
  { id: "f3", cat: "fries", name: "Garlic Mayo Fries", price: 399 },
  { id: "f4", cat: "fries", name: "Bar.B.Q Fries", price: 399 },
  { id: "f5", cat: "fries", name: "Chicken Nuggets", price: 399 },
  { id: "f6", cat: "fries", name: "Fried Chicken Wings", price: 599 },
  { id: "f7", cat: "fries", name: "Buffalo Wings", price: 649 },
  // Salad
  { id: "s1", cat: "salad", name: "Russian Salad", price: 599 },
  { id: "s2", cat: "salad", name: "Fresh Salad", price: 149 },
  { id: "s3", cat: "salad", name: "Mint Sauce", price: 149 },
  { id: "s4", cat: "salad", name: "Zera Raita", price: 149 },
  // Soup
  {
    id: "o1",
    cat: "soup",
    name: "Hot & Sour Soup",
    hasVariants: true,
    variants: [
      { label: "Small", price: 399 },
      { label: "Half", price: 699 },
      { label: "Full", price: 999 },
    ],
  },
  {
    id: "o2",
    cat: "soup",
    name: "Chicken Corn Soup",
    hasVariants: true,
    variants: [
      { label: "Small", price: 399 },
      { label: "Half", price: 699 },
      { label: "Full", price: 999 },
    ],
  },
  // Hot & Cold
  { id: "hc1", cat: "hotcold", name: "Matka Chai", price: 149 },
  { id: "hc2", cat: "hotcold", name: "Mineral Water (S)", price: 100 },
  { id: "hc3", cat: "hotcold", name: "Mineral Water (L)", price: 149 },
  { id: "hc4", cat: "hotcold", name: "Tin Pack Mix", price: 149 },
  { id: "hc5", cat: "hotcold", name: "Fresh Lime", price: 299 },
  // Tandoor
  { id: "t1", cat: "tandoor", name: "Roti", price: 20 },
  { id: "t2", cat: "tandoor", name: "Roghni Naan", price: 110 },
  { id: "t3", cat: "tandoor", name: "Garlic Naan", price: 110 },
  { id: "t4", cat: "tandoor", name: "Kalwanji Naan", price: 110 },
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-001",
    time: "12:34 PM",
    items: 5,
    total: 2450,
    isNew: false,
    itemList: [],
  },
  {
    id: "ORD-002",
    time: "12:18 PM",
    items: 3,
    total: 1647,
    isNew: false,
    itemList: [],
  },
  {
    id: "ORD-003",
    time: "11:55 AM",
    items: 7,
    total: 3890,
    isNew: false,
    itemList: [],
  },
  {
    id: "ORD-004",
    time: "11:30 AM",
    items: 2,
    total: 1098,
    isNew: false,
    itemList: [],
  },
  {
    id: "ORD-005",
    time: "11:12 AM",
    items: 4,
    total: 2196,
    isNew: false,
    itemList: [],
  },
];

export const SHEET_HEIGHTS = { hidden: 0, collapsed: 72, peek: 320, expanded: 560 };
