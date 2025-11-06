import moment from "moment"

const date = () => moment().toDate()

export const currentTime = () => new Date(date())
export const momentTime = (currentDate?: Date) => moment(currentDate ?? new Date(date()))
