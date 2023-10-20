const STATUS={
    "COMPLETE":"1",
    "CONTINUING":"0"
}
const DB={
    "TASK":"tasks/"
}
const DATE_NOW = new Date().toLocaleDateString('tr-TR', { weekday: "short", year: "numeric", month: "short", day: "numeric" }) + " " + new Date().toLocaleTimeString('tr-TR');