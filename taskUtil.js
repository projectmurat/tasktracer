const STATUS={
    "CONTINUING":"0",
    "COMPLETE":"1",
    "CANCEL":"3"
}
const DB={
    "TASK":"tasks/"
}
const CHOOSE_FILTER = {
    "COMPLETE":"Tamamlandı",
    "CONTINUING":"Devam Ediyor",
    "CANCEL":"İptal",
    "ALL":"Tümü"
}
const DATE_NOW = new Date().toLocaleDateString('tr-TR', { weekday: "short", year: "numeric", month: "short", day: "numeric" }) + " " + new Date().toLocaleTimeString('tr-TR');