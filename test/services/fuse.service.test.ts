import { fuzzySearch } from "app/services/search/fuse.service"

describe("fuse.service", () => {
  it("maps fuse search results to items", () => {
    const mockFuse = {
      search: jest.fn(() => [{ item: { name: "Yaume Aashura" } }]),
    }
    const results = fuzzySearch(mockFuse as never, "Yaume") as Array<{ name: string }>
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe("Yaume Aashura")
  })

  it("returns empty for blank query", () => {
    const mockFuse = { search: jest.fn() }
    expect(fuzzySearch(mockFuse as never, "   ")).toEqual([])
    expect(mockFuse.search).not.toHaveBeenCalled()
  })
})
