document.addEventListener('DOMContentLoaded', function () {
    let selectedTask;
    let tasks;

    const searchBox = document.getElementById('searchBox');
    const showCompleted = document.getElementById('showCompleted');
    const showOngoing = document.getElementById('showOngoing');
    const showCanceled = document.getElementById('showCanceled');
    const showAll = document.getElementById('showAll');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const sumRegisterSpan = document.getElementById('sumRegisterSpan');
    const btnTaskAdd = document.getElementById('btnTaskAdd');
    const btnSetTaskCompleted = document.getElementById("completedTaskButton");
    const btnSetTaskKeepGoing = document.getElementById("keepTaskButton");
    const btnSetTaskCancel = document.getElementById("cancelTaskButton");
    const btnDeleteTaskCancel = document.getElementById("deleteTaskButton");
    const chooseFilterSpanInfo = document.getElementById("chooseFilterLabelSpan");
    const copyClipBoardButton = document.getElementById("copy-button");

    searchBox.addEventListener('input', filterTasks);
    showCompleted.addEventListener('click', () => filterTasksByStatus(STATUS.COMPLETE));
    showOngoing.addEventListener('click', () => filterTasksByStatus(STATUS.CONTINUING));
    showCanceled.addEventListener('click', () => filterTasksByStatus(STATUS.CANCEL));
    showAll.addEventListener('click', () => showAllTasks("*"));
    addTaskButton.addEventListener('click', () => $('#taskAddModal').modal('show'));
    document.querySelector('.search-icon').addEventListener('click', () => filterTasks());
    btnTaskAdd.addEventListener('click', () => saveTask());
    btnSetTaskCompleted.addEventListener('click', () => setTaskCompleted());
    btnSetTaskKeepGoing.addEventListener('click', () => setTaskKeepGoing());
    btnSetTaskCancel.addEventListener('click',() => setTaskCancel());
    btnDeleteTaskCancel.addEventListener('click',() => deleteTask());
    copyClipBoardButton.addEventListener('click',() => copyToClipboard());


    function renderTasks(filteredTasks) {
        filteredTasks.sort((a, b) => convertDate(b.lastUpdated).getTime() - convertDate(a.lastUpdated).getTime());
        taskList.innerHTML = '';
        sumRegisterSpan.innerText = "Toplam Kayıt Sayısı: " + filteredTasks.length;
        filteredTasks.forEach(task => {
            let taskCompany = task.code.slice(0, 2);
            let company;
            if (taskCompany == "QF") {
                company = "https://www.sigortadunyasi.com.tr/wp-content/uploads/2018/02/quick-logo.jpg";

            }
            else if(taskCompany == "SF"){
                company = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuYnrKO5HWjil0ZXkDNyahIin5XOtyQ6a-Ww&s";
            }
            else if(taskCompany == "PP"){
                company = "https://cdn-icons-png.flaticon.com/512/762/762686.png";
            }
            else company = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE8HX7qb4U31mU2NkcdAEZB77dHX5phPYayQ&s";
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';


            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt';
            deleteIcon.id = task.id;
            deleteIcon.style.position = 'absolute';
            deleteIcon.style.top = '7px';
            deleteIcon.style.right = '7px';
            deleteIcon.style.cursor = 'pointer';
            deleteIcon.addEventListener('click', function (e) {
                e.stopPropagation();
                if (confirm("[ " + task.code + " ]" + " kodlu taskı silmek istediğinize emin misiniz?")) {
                    let path = DB.TASK + this.id;
                    firebase.database().ref(path).remove()
                        .then(function () {
                            console.log("Görev silindi!");
                        })
                        .catch(function (error) {
                            throw new Error("delete comment error", error).stack;
                        });
                }
            });

            const taskInfoContainer = document.createElement('div');
            taskInfoContainer.style.display = 'flex';
            taskInfoContainer.style.alignItems = 'center';

            taskInfoContainer.appendChild(deleteIcon);

            const taskImage = document.createElement('img');
            taskImage.src = company;
            taskImage.alt = "Resmin açıklaması";
            taskImage.style.marginRight = '10px';
            taskImage.width = taskCompany == "PP" ? "85":"125"//taskCompany == "QF" ? "125" : "125";
            taskImage.height = "80";
            taskInfoContainer.appendChild(taskImage);

            const taskType = document.createElement('span');
            taskType.className = `task-type ${task.type.toLowerCase()}`;
            taskType.innerText = task.type;
            taskInfoContainer.appendChild(taskType);

            taskItem.appendChild(taskInfoContainer);

            const taskCode = document.createElement('span');
            taskCode.className = 'task-code';
            taskCode.innerText = `${task.code} - ${task.header}`;
            taskItem.appendChild(taskCode);

            const dateContainer = document.createElement('div');
            dateContainer.className = 'date-container';

            const createDateContainer = document.createElement('div');
            createDateContainer.className = 'date-info-container';

            const taskDateLabel = document.createElement('span');
            taskDateLabel.className = 'task-date-label';
            taskDateLabel.innerText = 'Oluşturulma Tarihi:';
            createDateContainer.appendChild(taskDateLabel);

            const taskDate = document.createElement('span');
            taskDate.className = 'task-date';
            taskDate.innerText = task.createdAt;
            createDateContainer.appendChild(taskDate);

            dateContainer.appendChild(createDateContainer);

            const updateDateContainer = document.createElement('div');
            updateDateContainer.className = 'date-info-container';

            const taskLastUpdateDateLabel = document.createElement('span');
            taskLastUpdateDateLabel.className = 'task-date-label';
            taskLastUpdateDateLabel.innerText = 'Son Güncelleme Tarihi:';
            updateDateContainer.appendChild(taskLastUpdateDateLabel);

            const taskUpdatedDate = document.createElement('span');
            taskUpdatedDate.className = 'task-date';
            taskUpdatedDate.innerText = task.lastUpdated;
            updateDateContainer.appendChild(taskUpdatedDate);

            dateContainer.appendChild(updateDateContainer);

            if (task.completionDate != "null") {
                const completionDateContainer = document.createElement('div');
                completionDateContainer.className = 'date-info-container';

                const checkmarkIcon = document.createElement('span');
                checkmarkIcon.innerText = '✔';
                checkmarkIcon.style.color = 'green';
                checkmarkIcon.style.marginRight = '5px';
                checkmarkIcon.style.padding = "1px 6px";
                checkmarkIcon.style.fontSize = "20px";
                completionDateContainer.appendChild(checkmarkIcon);

                const taskCompletionDateLabel = document.createElement('span');
                taskCompletionDateLabel.className = 'task-date-label';
                taskCompletionDateLabel.style.color = "#8840b6";
                taskCompletionDateLabel.innerText = 'Tamamlanma Tarihi:';
                completionDateContainer.appendChild(taskCompletionDateLabel);

                const taskCompletionDate = document.createElement('span');
                taskCompletionDate.className = 'task-date';
                taskCompletionDate.style.color = "#8840b6";
                taskCompletionDate.style.fontWeight = "bolder";
                taskCompletionDate.innerText = task.completionDate;
                completionDateContainer.appendChild(taskCompletionDate);

                dateContainer.appendChild(completionDateContainer);

            }
            if (task.cancelDate != "null") {
                const completionDateContainer = document.createElement('div');
                completionDateContainer.className = 'date-info-container';

                const checkmarkIcon = document.createElement('span');
                checkmarkIcon.innerText = 'X';
                checkmarkIcon.style.color = 'red';
                checkmarkIcon.style.marginRight = '5px';
                checkmarkIcon.style.padding = "1px 6px";
                checkmarkIcon.style.fontSize = "20px";
                completionDateContainer.appendChild(checkmarkIcon);

                const taskCompletionDateLabel = document.createElement('span');
                taskCompletionDateLabel.className = 'task-date-label';
                taskCompletionDateLabel.style.color = "rgb(255 0 0)";
                taskCompletionDateLabel.innerText = 'İptal Edilme Tarihi:';
                completionDateContainer.appendChild(taskCompletionDateLabel);

                const taskCompletionDate = document.createElement('span');
                taskCompletionDate.className = 'task-date';
                taskCompletionDate.style.color = "rgb(255 0 0)";
                taskCompletionDate.style.fontWeight = "bolder";
                taskCompletionDate.innerText = task.cancelDate;
                completionDateContainer.appendChild(taskCompletionDate);

                dateContainer.appendChild(completionDateContainer);

            }

            const commentVountContainer = document.createElement('div');
            commentVountContainer.className = 'date-info-container';

            const taskCommentCount = document.createElement('span');
            taskCommentCount.className = 'task-date-label';
            taskCommentCount.innerText = 'Yorum Sayısı: ';
            commentVountContainer.appendChild(taskCommentCount);

            const taskCommentCountNumber = document.createElement('span');
            taskCommentCountNumber.className = 'task-date';
            taskCommentCountNumber.innerText = task.comments ? Object.keys(task.comments).length : 0;
            commentVountContainer.appendChild(taskCommentCountNumber);

            dateContainer.appendChild(commentVountContainer);

            taskItem.appendChild(dateContainer);

            const taskStatus = document.createElement('span');
            let className = `task-status `;
            let innerText = "";
            switch (task.status) {
                case STATUS.CONTINUING:
                    className += 'ongoing';
                    innerText = "Devam Ediyor";
                    break;
                case STATUS.COMPLETE:
                    className += 'completed';
                    innerText = "Tamamlandı";
                    break;
                case STATUS.CANCEL:
                    className += 'canceled';
                    innerText = "İptal Edildi";
                    break;
                default:
                    break;
            }
            taskStatus.className = className;
            taskStatus.innerText = innerText;

            taskItem.appendChild(taskStatus);

            taskItem.addEventListener('click', function () {
                $('#taskDetailsModal').modal('show');
                displayTaskDetails(task);

            });

            taskList.appendChild(taskItem);
        });
    }

    function displayTaskDetails(task) {
        selectedTask = task;
        switch (task.status) {
            case STATUS.CONTINUING:
                btnSetTaskCompleted.style.display = "block";
                btnSetTaskCancel.style.display = "block";
                btnSetTaskKeepGoing.style.display = "none";
                break;
            case STATUS.COMPLETE:
                btnSetTaskCancel.style.display = "none";
                btnSetTaskKeepGoing.style.display = "block";
                btnSetTaskCompleted.style.display = "none";
                break;
            case STATUS.CANCEL:
                btnSetTaskCompleted.style.display = "none";
                btnSetTaskKeepGoing.style.display = "none";
                btnSetTaskCancel.style.display = "none";
                break;
            default:
                break;
        }
        const commentsList = document.getElementById('taskComments');
        document.getElementById("taskCode").innerText = task.code
        document.getElementById("taskTitle").innerText = task.title
        commentsList.innerHTML = '';

        Object.values(task.comments || []).sort((a, b) => convertDate(b.date).getTime() - convertDate(a.date).getTime()).forEach(addCommentToDOM);

        const newCommentItem = createEditableCommentItem('', '', '');
        commentsList.appendChild(newCommentItem);

        document.getElementById("commentCountSpan").innerText = task.comments ? Object.keys(task.comments).length : 0;
    }

    function addCommentToDOM(comment) {
        const listItem = createEditableCommentItem(comment.text, comment.date, comment.id);
        document.getElementById('taskComments').appendChild(listItem);
    }

    function createEditableCommentItem(text, date, id) {
        const listItem = document.createElement('li');
        const commentContent = document.createElement('div');
        const commentDate = document.createElement('div');
        const saveButton = document.createElement('button');
        const commentContainer = document.createElement('div');

        commentContent.contentEditable = true;
        commentContent.className = 'comment-content ' + id;
        commentContent.innerText = text;
        commentContent.dataset.initialText = text;
        commentContent.addEventListener('input', handleCommentInput);

        commentDate.className = 'comment-date';
        commentDate.innerText = date;

        saveButton.className = 'save-comment-btn';
        saveButton.innerText = 'Kaydet';
        saveButton.id = id;
        saveButton.onclick = function () {
            if (this.id) {
                let editedComment = document.getElementsByClassName(this.id)[1].textContent;
                let path = DB.TASK + selectedTask.id + "/" + "comments" + "/" + this.id;
                let updateData = {
                    text: editedComment,
                    date: getDate()
                };
                firebase.database().ref(path).update(updateData, (error) => {
                    if (error) {
                        throw new Error("update comment error", error).stack;
                    } else {
                        console.log("updated comment successfully");
                        document.getElementById(this.id).style.display = "none";
                        updateLastUpdated();
                    }
                })
            }
            else {
                let path = DB.TASK + selectedTask.id + "/" + "comments" + "/";
                const comments = document.getElementsByClassName("comment-content");
                let insertComment = getComment();
                let insertDate = getDate();
                let insertData = {
                    text: insertComment,
                    date: insertDate
                };
                firebase.database().ref(path).push().set(insertData, error => {
                    if (error) {
                        throw new Error("insert comment error", error).stack;
                    }
                    else {
                        getEmptyCommentButton().style.display = "none";
                        console.log("note inserted.")
                        updateLastUpdated();
                    }
                })
            }
            console.log(selectedTask);
        };
        saveButton.style.display = 'none';
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.className = 'delete-comment-btn ' + id;
        deleteButton.onclick = function () {
            let deletedCommentId = this.className.split(' ')[1];
            if (deletedCommentId != '') {
                if (confirm(deletedCommentId + " id'li yorum silinecek. Onaylıyor musunuz?")) {
                    let path = DB.TASK + selectedTask.id + "/" + "comments" + "/" + deletedCommentId;
                    firebase.database().ref(path).remove()
                        .then(function () {
                            listItem.remove();
                            updateLastUpdated();

                        })
                        .catch(function (error) {
                            throw new Error("delete comment error", error).stack;
                        });
                }
            }
        };

        commentContainer.insertBefore(deleteButton, commentContainer.firstChild);

        commentContainer.className = 'comment';

        commentContainer.appendChild(commentContent);
        commentContainer.appendChild(commentDate);
        commentContainer.appendChild(saveButton);
        listItem.appendChild(commentContainer);

        return listItem;
    }

    function handleCommentInput(event) {
        const saveButton = event.target.nextSibling.nextSibling;
        if (event.target.innerText.trim() !== '' && event.target.innerText !== event.target.dataset.initialText) {
            saveButton.style.display = 'block';
        } else {
            saveButton.style.display = 'none';
        }
    }

    function filterTasks() {
        const searchTerm = searchBox.value.toLowerCase();
        let result;
        result = tasks.filter(task =>
            task.code.toLowerCase().includes(searchTerm) ||
            task.header.toLowerCase().includes(searchTerm) ||
            task.header.toLowerCase().includes(searchTerm)
        );
        if (result.length == 0) {
            result = tasks.filter(task => {
                if (task.comments != undefined) {
                    let thisTaskComment = Object.values(task.comments);
                    if (thisTaskComment.length > 0) {
                        return thisTaskComment.some(comment => comment.text.toLowerCase().includes(searchTerm));
                    }
                    return false;
                }
                return false;

            });
        }

        renderTasks(result);
    }

    function filterTasksByStatus(status) {
        let message = "Filter: ";
        switch (status) {
            case STATUS.CONTINUING:
                message += CHOOSE_FILTER.CONTINUING;
                break;
            case STATUS.COMPLETE:
                message += CHOOSE_FILTER.COMPLETE;
                break;
            case STATUS.CANCEL:
                message += CHOOSE_FILTER.CANCEL;
                break;
            default:
                message += CHOOSE_FILTER.ALL;
                break;
        }
        chooseFilterSpanInfo.innerText = message;

        let filter ={key:"status",value:status};
        queryTask(filter,(responseTask)=>{
            renderTasks(Object.values(responseTask));
        })
    }

    function showAllTasks(value) {
        let filter ={key:"status",value:value}
        queryTask(filter,(responseTask)=>{
            renderTasks(Object.values(responseTask));
            chooseFilterSpanInfo.innerText = "Filter: "+CHOOSE_FILTER.ALL;
        })

    }

    function saveTask() {
        const labelType = document.getElementById("labelType").value;

        const code = document.getElementById("code").value;

        const header = document.getElementById("header").value;

        const taskType = document.getElementById("taskType").value;

        const title = document.getElementById("title").value;

        let taskObject = {

            code: labelType + "-" + code,
            header: header,
            type: taskType,
            status: "0",
            createdAt: getDate(),
            title: title,
            lastUpdated: getDate(),
            completionDate: "null",
            comments: {},
            cancelDate:"null"
        };
        FirebaseRealtime.SaveTask({
            path: DB.TASK,
            params: taskObject,
            done: (saveResponse) => {
                if (saveResponse) {
                    $('#taskAddModal').modal('hide');
                }
            },
            fail: (error) => {
                throw new Error("SaveTask Error").stack;
            }
        })
    }
    function setTaskCompleted() {
        FirebaseRealtime.UpdateTask({
            path: DB.TASK,
            where: { "key": selectedTask.id },
            params: { "status": STATUS.COMPLETE, "completionDate": getDate() },
            done: (updateResponse) => {
                if (updateResponse) {
                    btnSetTaskCompleted.style.display = "none";
                    btnSetTaskKeepGoing.style.display = "block";
                    updateLastUpdated();
                }
            },
            fail: (error) => {
                throw new Error("UpdateTask eRROR").stack;
            }
        })
    }
    function setTaskKeepGoing(params) {
        FirebaseRealtime.UpdateTask({
            path: DB.TASK,
            where: { "key": selectedTask.id },
            params: { "status": STATUS.CONTINUING, "completionDate": "null" },
            done: (updateResponse) => {
                if (updateResponse) {
                    btnSetTaskKeepGoing.style.display = "none";
                    btnSetTaskCompleted.style.display = "block";
                    updateLastUpdated();
                }
            },
            fail: (error) => {
                throw new Error("UpdateTask eRROR").stack;
            }
        })
    }
    function setTaskCancel(){
        FirebaseRealtime.UpdateTask({
            path: DB.TASK,
            where: { "key": selectedTask.id },
            params: { "status": STATUS.CANCEL, "cancelDate": getDate() },
            done: (updateResponse) => {
                if (updateResponse) {
                    btnSetTaskCancel.style.display = "none";
                    btnSetTaskKeepGoing.style.display = "block";
                    updateLastUpdated();
                }
            },
            fail: (error) => {
                throw new Error("UpdateTask eRROR").stack;
            }
        })
    }
    function deleteTask(){
        let openedTaskCode = document.getElementById("taskCode").innerText;
        let openedTask = tasks.filter(i=>i.code == openedTaskCode)[0];
        if (confirm("[ " + openedTaskCode + " ]" + " kodlu taskı silmek istediğinize emin misiniz?")) {
            let path = DB.TASK + openedTask.id;
            firebase.database().ref(path).remove()
                .then(function () {
                    console.log("Görev silindi!");
                    $('#taskDetailsModal').modal('hide')
                })
                .catch(function (error) {
                    throw new Error("delete comment error", error).stack;
                });
        }
    }

    function getComment() {
        const comments = document.getElementsByClassName("comment-content");
        let insertComment;

        for (const element of comments) {
            if (element.classList.length === 1) {
                insertComment = element.textContent;
                break;
            }
        }
        return insertComment;
    }

    function getEmptyCommentButton() {
        const buttons = document.getElementsByClassName("save-comment-btn");
        let selectedButon;

        for (const element of buttons) {
            if (element.id.length == 0) {
                selectedButon = element;
                break;
            }
        }
        return selectedButon;
    }
    function updateLastUpdated() {
        firebase.database().ref(DB.TASK + selectedTask.id).update({ lastUpdated: getDate() }, (error) => {
            if (error) {
                throw new Error("update task date error", error).stack;
            }
            else {
                console.log("updated task edited date successfully");
            }
        })
    }
    document.getElementById("filterIcon").addEventListener("click", function () {
        const menu = document.getElementById("filterMenu");
        menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
        event.stopPropagation();
    });
    document.addEventListener("click", function () {
        const menu = document.getElementById("filterMenu");
        if (menu.style.display === "block") {
            menu.style.display = "none";
        }
    });
    function convertDate(str) {
        const months = {
            "Oca": 0,
            "Şub": 1,
            "Mar": 2,
            "Nis": 3,
            "May": 4,
            "Haz": 5,
            "Tem": 6,
            "Ağu": 7,
            "Eyl": 8,
            "Eki": 9,
            "Kas": 10,
            "Ara": 11
        };

        const parts = str.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1]];
        const year = parseInt(parts[2], 10);
        const timeParts = parts[4].split(':');
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);
        const second = parseInt(timeParts[2], 10);

        return new Date(year, month, day, hour, minute, second);
    }
    function copyToClipboard() {
        navigator.clipboard.writeText(selectedTask.code).then(function() {
            alert("Panoya kopyalandı!");
        }, function() {
            alert("Panoya kopyalanırken hata oluştu!");
        });
    }
    function getDate(){
        return new Date().toLocaleDateString('tr-TR', { weekday: "short", year: "numeric", month: "short", day: "numeric" }) + " " + new Date().toLocaleTimeString('tr-TR');
    }

    function queryTask(filter,callback){
        FirebaseRealtime.QueryTasks({
            path: DB.TASK,
            filter:filter,
            done: (queryResults) => {
                tasks = Object.values(queryResults);
                callback(queryResults);
            },
            fail: (error) => {
                throw new Error("QueryTasks Error").stack;
            }
        })
    }
    function start(){
        let filter = {key:"status",value:STATUS.CONTINUING}
        queryTask(filter,(responseTask)=>{
            for (let key in responseTask) {
                if (responseTask.hasOwnProperty(key)) {
                    responseTask[key].id = key;
                    if (responseTask[key].comments && typeof responseTask[key].comments === 'object') {
                        for (let commentKey in responseTask[key].comments) {
                            if (responseTask[key].comments.hasOwnProperty(commentKey)) {
                                responseTask[key].comments[commentKey].id = commentKey;
                            }
                        }
                    }
                }
            }
            tasks = Object.values(responseTask);
            renderTasks(tasks.filter(i => i.status == "0"));
            chooseFilterSpanInfo.innerText = "Filter: "+CHOOSE_FILTER.CONTINUING;
        })
    }
    start();
});