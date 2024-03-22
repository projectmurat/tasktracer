/*firebase.initializeApp({
    apiKey: "AIzaSyB7rwTvnjUrsL-493Yf6LwDW-Yi59kONLQ",
    authDomain: "tasktracer-ee23b.firebaseapp.com",
    databaseURL: "https://tasktracer-ee23b-default-rtdb.firebaseio.com",
    projectId: "tasktracer-ee23b",
    storageBucket: "tasktracer-ee23b.appspot.com",
    messagingSenderId: "893591020493",
    appId: "1:893591020493:web:23487c19b7bf62d1a61a84",
    measurementId: "G-QYW8E5CP8X"
});*/
firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASURE_ID
});
let FirebaseRealtime = (
    function () {
        /**
         * @param {Object} args
         */
        function QueryTasks(args) {
            document.getElementById("loaderText").style.display = "block";
            document.getElementById("loader").style.display = "block";
            let fail = args.fail;
            try {
                let path = args.path;
                let done = args.done;
                let filter = args.filter != undefined ? args.filter : "*";

                if(filter.value == "*"){
                    firebase.database().ref(path).on("value", (snapshot) => {
                        document.getElementById("loaderText").style.display = "none";
                        document.getElementById("loader").style.display = "none";
                        done(snapshot.val())

                    })
                }
                else{
                    let key = filter.key;
                    let value = filter.value;
                    firebase.database().ref(path).orderByChild(key).equalTo(value).on("value", (snapshot) => {
                        document.getElementById("loaderText").style.display = "none";
                        document.getElementById("loader").style.display = "none";
                        done(snapshot.val());
                    });
                }

            } catch (error) {
                document.getElementById("loaderText").style.display = "none";
                document.getElementById("loader").style.display = "none";
                fail(error);
            }

        }
        function SaveTask(args) {
            let fail = args.fail;
            try {
                let path = args.path;
                let done = args.done;
                let params = args.params;
                firebase.database().ref(path).push().set(params, error => {
                    if (error) {
                        fail(error);
                    }
                    else {
                        done(true);
                    }
                })
            }
            catch (error) {
                throw new Error(error).stack;
            }
        }

        function UpdateTask(args) {
            let fail = args.fail;
            try {
                let path = args.path;
                let where = args.where;
                let params = args.params;
                let done = args.done;
                firebase.database().ref(path + where.key).update(params, (error) => {
                    if (error) {
                        fail(error);
                    } else {
                        done(true);
                    }
                })
            }
            catch (error) {
                throw new Error(error).stack;
            }
        }

        function UpdateComment(args) {
            let fail = args.fail;
            try {
                let path = args.path;
                let where = args.where;
                let params = args.params;
                let done = args.done;
                firebase.database().ref(path + where.key).update(params, (error) => {
                    if (error) {
                        fail(error);
                    } else {
                        done(true);
                    }
                })
            }
            catch (error) {
                throw new Error(error).stack;
            }
        }

        function InsertComment(args) {
            let fail = args.fail;
            try {
                let path = args.path;
                let done = args.done;
                let params = args.params;
                firebase.database().ref(path).push().set(params, error => {
                    if (error) {
                        fail(error);
                    }
                    else {
                        done(true);
                    }
                })
            }
            catch (error) {
                throw new Error(error).stack;
            }
        }

        return {
            QueryTasks: QueryTasks,
            SaveTask: SaveTask,
            UpdateTask: UpdateTask
        }
    }
)();