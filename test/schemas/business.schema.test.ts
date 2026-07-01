import { createBusinessSchema } from "app/schemas/business.schema"

describe("createBusinessSchema", () => {
  it("accepts valid business input", () => {
    const result = createBusinessSchema.safeParse({
      name: "Halal Kitchen",
      description: "Authentic Bohra cuisine and catering services",
      category: "halal",
      phone: "+919876543210",
      location: "Mumbai, India",
    })
    expect(result.success).toBe(true)
  })

  it("rejects short name", () => {
    const result = createBusinessSchema.safeParse({
      name: "AB",
      description: "Too short name test case",
      category: "halal",
      phone: "+919876543210",
      location: "Mumbai",
    })
    expect(result.success).toBe(false)
  })
})
