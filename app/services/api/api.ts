/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/Services.md)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import type {
  ApiConfig,
  ApiDataResponse,
  ApiLocationResponse,
  ApiMiqaatResponse,
} from "./api.types"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        "x-app-key": "1234567890",
      },
    })
  }

  fetchVersion = async (key: string): Promise<number | GeneralApiProblem> => {
    const response: ApiResponse<ApiDataResponse> = await this.apisauce.get(`data?key=${key}`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return parseInt(data?.value ?? "1", 10)
    } catch (error) {
      if (__DEV__) {
        console.log(error)
      }
      return { kind: "bad-data" }
    }
  }

  fetchData = async ({
    key,
  }: {
    key: string
  }): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> => {
    const response: ApiResponse<ApiDataResponse> = await this.apisauce.get(`data?key=${key}`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data }
    } catch (error) {
      if (__DEV__) {
        console.log(error)
      }
      return { kind: "bad-data" }
    }
  }

  fetchLocation = async (
    lat: number,
    lon: number,
  ): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> => {
    const response: ApiResponse<ApiLocationResponse> = await this.apisauce.get(
      `location?lat=${lat}&lng=${lon}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data }
    } catch (error) {
      if (__DEV__) {
        console.log(error)
      }
      return { kind: "bad-data" }
    }
  }

  fetch = async (url: string): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> => {
    // add x-app-key in header

    const response: ApiResponse<any> = await this.apisauce.get(url, {})

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem

      return { kind: "bad-data" }
    }

    try {
      const data = response.data
      return { kind: "ok", data }
    } catch (error) {
      if (__DEV__) {
        console.log(error)
      }
      return { kind: "bad-data" }
    }
  }

  fetchMiqaats = async (): Promise<{ kind: "ok"; data: ApiMiqaatResponse } | GeneralApiProblem> => {
    const response: ApiResponse<ApiMiqaatResponse> = await this.apisauce.get(`miqaat/all`)

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data as ApiMiqaatResponse
      return { kind: "ok", data }
    } catch (error) {
      if (__DEV__) {
        console.log(error)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
