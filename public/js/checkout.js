
function confirmDelete(name, pict){
    alert("Удалить?");
    if (confirm("Вы подтверждаете удаление?")) {
        return true;
    } else {
        return false;
    }

}





var tableRow = $("td").filter(function() {
    return $(this).text() == document.getElementById("firstLevelname").innerHTML;
}).closest("tr");
$(tableRow).addClass("line");


var tableRow2 = $("td").filter(function() {
    return $(this).text() == document.getElementById("secondLevelname").innerHTML;
}).closest("tr");
$(tableRow2).addClass("line");
