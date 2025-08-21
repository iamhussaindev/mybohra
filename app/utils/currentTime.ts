import moment from "moment"

const date = () => moment().toDate() // .set("hour", 22).set("minute", 55).add(-1, "day")

export const currentTime = () => new Date(date())
export const momentTime = (currentDate?: Date) => moment(currentDate ?? new Date(date()))
