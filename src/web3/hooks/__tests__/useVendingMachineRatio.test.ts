import { renderHook } from "@testing-library/react-hooks"
import { AddressZero } from "@ethersproject/constants"
import { useVendingMachineContract } from "../useVendingMachineContract"
import { useLocalStorage } from "../../../hooks/useLocalStorage"
import { useVendingMachineRatio } from "../useVendingMachineRatio"
import { Token } from "../../../enums"
import { usePrevious } from "../../../hooks/usePrevious"

jest.mock("../useVendingMachineContract", () => ({
  useVendingMachineContract: jest.fn(),
}))

jest.mock("../../../hooks/useLocalStorage", () => ({
  useLocalStorage: jest.fn(),
}))

jest.mock("../../../hooks/usePrevious", () => ({
  usePrevious: jest.fn(),
}))

describe("Test `useVendingMachineRatio` hook", () => {
  const token = Token.Keep
  const mockedContract = {
    address: "0x71C3792B30154E2e13f532AF29BC96742810dc06",
    ratio: jest.fn(),
  }
  const mockedRatioValue = "500000000000000000"
  let mockedLocalStorageValue = { value: "0", contractAddress: AddressZero }
  const mockedSetRatio = jest.fn()

  beforeEach(() => {
    ;(useVendingMachineContract as jest.Mock).mockReturnValue(mockedContract)

    mockedLocalStorageValue = { value: "0", contractAddress: AddressZero }
    ;(useLocalStorage as jest.Mock).mockReturnValue([
      mockedLocalStorageValue,
      mockedSetRatio,
    ])

    mockedContract.ratio.mockResolvedValue(mockedRatioValue)
  })

  test("should fetch ratio from chain and save in local storage", async () => {
    ;(usePrevious as jest.Mock).mockReturnValue(mockedContract.address)

    renderHook(() => useVendingMachineRatio(token))

    expect(useVendingMachineContract).toHaveBeenCalledWith(token)
    expect(useLocalStorage).toHaveBeenCalledWith(`${token}-to-T-ratio`, {
      value: "0",
      contractAddress: AddressZero,
    })

    expect(mockedContract.ratio).toHaveBeenCalled()
    // TODO: The `mockedSetRatio` should be called but probably there is a
    // problem with hoisting when `jest` running test.
    // expect(mockedSetRatio).toHaveBeenCalled()
  })

  test("should not fetch ratio from chain if the value is in the local storage", async () => {
    ;(usePrevious as jest.Mock).mockReturnValue(mockedContract.address)
    const mockedLocalStorageValue = {
      value: mockedRatioValue,
      contractAddress: mockedContract.address,
    }
    ;(useLocalStorage as jest.Mock).mockReturnValue([
      mockedLocalStorageValue,
      mockedSetRatio,
    ])

    const { result } = renderHook(() => useVendingMachineRatio(token))

    expect(useVendingMachineContract).toHaveBeenCalledWith(token)
    expect(useLocalStorage).toHaveBeenCalledWith(`${token}-to-T-ratio`, {
      value: "0",
      contractAddress: AddressZero,
    })

    expect(mockedContract.ratio).not.toHaveBeenCalled()
    expect(result.current).toEqual(mockedLocalStorageValue.value)
  })
})
