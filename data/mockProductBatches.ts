export const mockProductBatches = [
  {
    id: "pb-001",
    batchNumber: "BN-2024-03-01",
    productVariant: {
      id: "pv-001",
      name_variant: "Premium Arabica 250g",
      product: {
        name_product: "Gayo Coffee Beans"
      }
    },
    branch: {
      id: "br-001",
      name: "Jakarta Main Branch"
    },
    supplier: {
      id: "sup-001",
      name: "Tani Makmur Coffee"
    },
    initialQuantity: 100,
    currentQuantity: 45,
    costPrice: 75.00,
    manufacturingDate: "2024-01-10T00:00:00.000Z",
    expiryDate: "2025-01-10T00:00:00.000Z",
    receivedDate: "2024-01-15T00:00:00.000Z",
    status: "active"
  },
  {
    id: "pb-002",
    batchNumber: "BN-2024-03-02",
    productVariant: {
      id: "pv-002",
      name_variant: "Robusta Blend 500g",
      product: {
        name_product: "Java Heritage Coffee"
      }
    },
    branch: {
      id: "br-001",
      name: "Jakarta Main Branch"
    },
    supplier: {
      id: "sup-002",
      name: "Java Bean Suppliers"
    },
    initialQuantity: 200,
    currentQuantity: 15,
    costPrice: 45.50,
    manufacturingDate: "2023-10-05T00:00:00.000Z",
    expiryDate: "2024-04-05T00:00:00.000Z",
    receivedDate: "2023-10-15T00:00:00.000Z",
    status: "active" // Expiring soon based on dates
  },
  {
    id: "pb-003",
    batchNumber: "BN-2024-03-03",
    productVariant: {
      id: "pv-003",
      name_variant: "Green Tea Matcha 100g",
      product: {
        name_product: "Uji Matcha Premium"
      }
    },
    branch: {
      id: "br-002",
      name: "Bandung Branch"
    },
    supplier: {
      id: "sup-003",
      name: "Kyoto Tea Co."
    },
    initialQuantity: 50,
    currentQuantity: 50,
    costPrice: 120.99,
    manufacturingDate: "2023-08-20T00:00:00.000Z",
    expiryDate: "2024-02-20T00:00:00.000Z",
    receivedDate: "2023-09-01T00:00:00.000Z",
    status: "expired"
  },
  {
    id: "pb-004",
    batchNumber: "BN-2024-03-04",
    productVariant: {
      id: "pv-001",
      name_variant: "Premium Arabica 250g",
      product: {
        name_product: "Gayo Coffee Beans"
      }
    },
    branch: {
      id: "br-001",
      name: "Jakarta Main Branch"
    },
    supplier: {
      id: "sup-001",
      name: "Tani Makmur Coffee"
    },
    initialQuantity: 80,
    currentQuantity: 0,
    costPrice: 75.00,
    manufacturingDate: "2023-11-15T00:00:00.000Z",
    expiryDate: "2024-11-15T00:00:00.000Z",
    receivedDate: "2023-12-01T00:00:00.000Z",
    status: "sold_out"
  },
  {
    id: "pb-005",
    batchNumber: "BN-2024-03-05",
    productVariant: {
      id: "pv-004",
      name_variant: "Luwak Coffee 100g",
      product: {
        name_product: "Wild Luwak Selection"
      }
    },
    branch: {
      id: "br-002",
      name: "Bandung Branch"
    },
    supplier: {
      id: "sup-004",
      name: "Sumatra Specialty"
    },
    initialQuantity: 20,
    currentQuantity: 20,
    costPrice: 350.00,
    manufacturingDate: "2024-02-01T00:00:00.000Z",
    expiryDate: "2025-02-01T00:00:00.000Z",
    receivedDate: "2024-02-10T00:00:00.000Z",
    status: "hold"
  }
];
