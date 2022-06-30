import { createSlice } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction"
import { Zero } from "@ethersproject/constants"
import { BigNumber } from "@ethersproject/bignumber"
import { BonusEligibility } from "../../types"

interface BasicRewardsState<T> {
  isFetching: boolean
  hasFetched: boolean
  error: string
  rewards: T
  totalRewardsBalance: string
}

interface InterimRewards {
  [stakingProvider: string]: string
}

interface StakingBonusRewards {
  [stakingProvider: string]: BonusEligibility
}

interface RewardsState {
  stakingBonus: BasicRewardsState<StakingBonusRewards>
  interim: BasicRewardsState<InterimRewards>
  totalRewardsBalance: string
}

export const rewardsSlice = createSlice({
  name: "rewards",
  initialState: {
    // TODO: move the bonus eleigibility from the staking reducer to rewards.
    stakingBonus: {
      isFetching: false,
      hasFetched: false,
      error: "",
      rewards: {},
      totalRewardsBalance: "0",
    },
    interim: {
      isFetching: false,
      hasFetched: false,
      error: "",
      rewards: {},
      totalRewardsBalance: "0",
    },
    totalRewardsBalance: "0",
  } as RewardsState,
  reducers: {
    setInterimRewards: (
      state: RewardsState,
      action: PayloadAction<{ [stakingProvider: string]: string }>
    ) => {
      state.interim.rewards = action.payload
      state.interim.isFetching = false
      state.interim.hasFetched = true
      state.interim.totalRewardsBalance = calculateTotalInterimRewardsBalance(
        state.interim.rewards
      )
      state.totalRewardsBalance = calculateTotalRewardsBalance(state)
    },
    setStakingBonus: (
      state: RewardsState,
      action: PayloadAction<{ [stakingProvider: string]: BonusEligibility }>
    ) => {
      state.stakingBonus.rewards = action.payload
      state.stakingBonus.isFetching = false
      state.stakingBonus.hasFetched = true
      state.stakingBonus.totalRewardsBalance = calculateTotalBonusBalance(
        state.stakingBonus.rewards
      )
      state.totalRewardsBalance = calculateTotalRewardsBalance(state)
    },
  },
})

const calculateTotalBonusBalance = (
  stakingBonusRewards: StakingBonusRewards
): string => {
  return Object.values(stakingBonusRewards)
    .reduce(
      (totalBalance, bonus) =>
        totalBalance.add(bonus.isRewardClaimed ? "0" : bonus.reward),
      Zero
    )
    .toString()
}

const calculateTotalInterimRewardsBalance = (
  interimRewards: InterimRewards
): string => {
  return Object.values(interimRewards)
    .reduce((totalBalance, reward) => totalBalance.add(reward), Zero)
    .toString()
}

const calculateTotalRewardsBalance = (rewardsState: RewardsState) => {
  return BigNumber.from(rewardsState.stakingBonus.totalRewardsBalance)
    .sub(rewardsState.interim.totalRewardsBalance)
    .abs()
    .toString()
}

export const { setInterimRewards, setStakingBonus } = rewardsSlice.actions