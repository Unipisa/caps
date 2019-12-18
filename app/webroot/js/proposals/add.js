$(document).ready(function () {
    var exams = undefined;
    var groups = undefined;

    var curriculumURL = "../curricula/view/";
    var examsURL = "../exams.json";
    var groupsURL = "../groups.json";

    var compulsoryExams = undefined;
    var compulsoryGroups = undefined;
    var freeChoiceExams = undefined;

    var lastExamAdded = 0;
    var lastFreeChoiceExamAdded = 0;

    $.ajax({
        url: examsURL,
        success: function (response) { exams = response["exams"]; }
    });

    $.ajax({
        url: groupsURL,
        success: function (response) { groups = response["groups"]; }
    });

    $("input[type=submit]").hide();
    $("#proposalForm").bind("keyup keypress", function (e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
            e.preventDefault();
            return false;
        }
    });

    $("#curriculum-0-curriculum-id").change(function () {
        var curriculum = $("#curriculum-0-curriculum-id option:selected").text();
        var curriculumId = $(this).val();
        if (curriculumId === "")
            return;

        var baseHTML = undefined;
        if (curriculum.split(" ")[1] == "Triennale") {
            baseHTML = "<hr><h3>Primo anno: <span></span>/60</h3><nav></nav><hr><ul></ul><hr><h3>Secondo anno: <span></span>/60</h3><nav></nav><hr><ul></ul><hr><h3>Terzo anno: <span></span>/60</h3><nav></nav><hr><ul></ul>";
        } else {
            baseHTML = "<hr><h3>Primo anno: <span></span>/60</h3><nav></nav><hr><ul></ul><hr><h3>Secondo anno: <span></span>/60</h3><nav></nav><hr><ul></ul>";
        }

        $.ajax({
            url: curriculumURL + curriculumId + ".json",
            success: function (response) {
                compulsoryExams = response["compulsory_exams"];
                compulsoryGroups = response["compulsory_groups"];
                freeChoiceExams = response["free_choice_exams"];

                $("#proposalForm").html(baseHTML);

                addCompulsoryExams();
                addCompulsoryGroups();
                addFreeChoiceExams();
                addButtons();
                addCounters();
                addDeleteButtons();
                addKonamiCode();
            }
        });
    });

    var addCompulsoryExams = function () {
        for (var i = 0; i < compulsoryExams.length; i++) {
            var compulsoryExam = compulsoryExams[i];
            var examId = compulsoryExam["exam_id"];
            var year = compulsoryExam["year"];

            var exam;
            // XXX(jacquerie): I apologize.
            for (var j = 0; j < exams.length; j++) {
                if (exams[j]["id"] == examId) {
                    exam = exams[j];
                }
            }

            var selector = "#proposalForm > ul:nth-of-type(" + year + ")";
            var examHTML = "<select name=data[ChosenExam][" + i + "][exam_id] class=exam><option value=" + examId + ">" + exam["code"] + " — " + exam["name"] + " — " + exam["sector"]  + "</option></select>";
            var creditsHTML = "<select name=data[ChosenExam][" + i + "][credits] class=credits>";
            if (exam["sector"] === "PROFIN") {
                creditsHTML += "<option value=" + exam["credits"] + ">" + exam["credits"] + "</option>";
            } else {
                for (var j = exam["credits"]; j > 0; j--) {
                    creditsHTML += "<option value=" + j + ">" + j + "</option>";
                }
            }
            creditsHTML += "</select>";

            $(selector).append("<li>" + examHTML + creditsHTML + "</li>");
        }
    };

    var addCompulsoryGroups = function () {
        for (var i = 0; i < compulsoryGroups.length; i++) {
            var compulsoryGroup = compulsoryGroups[i];
            var groupId = compulsoryGroup["group_id"];
            var year = compulsoryGroup["year"];

            var group;
            // XXX(jacquerie): I apologize.
            for (var j = 0; j < groups.length; j++) {
                if (groups[j]["id"] == groupId) {
                    group = groups[j];
                }
            }

            var groupExams = group["exams"];
            var groupName = group["name"];

            var selector = "#proposalForm > ul:nth-of-type(" + year + ")";

            var groupHTML = "<option value='' disabled selected>Un esame a scelta nel gruppo " + groupName + "</option>";
            var examsHTML = "";
            for (var j = 0; j < groupExams.length; j++) {
                examsHTML += "<option value=" + groupExams[j]["id"] + ">" + groupExams[j]["code"] + " — " + groupExams[j]["name"] + " — " + groupExams[j]["sector"] + "</option>";
            }

            $(selector).append("<li><select name=data[ChosenExam][" + (i + compulsoryExams.length) + "][exam_id] class=exam>" + groupHTML + examsHTML + "</li></select>");
            $(selector + " li select:last").change({ i: i }, function (e) {
                var examId = $(this).val();
                var exam;
                // XXX(jacquerie): I apologize.
                for (var j = 0; j < exams.length; j++) {
                    if (exams[j]["id"] == examId) {
                        exam = exams[j];
                    }
                }

                var credits = exam["credits"];
                var creditsHTML = "<select name=data[ChosenExam][" + (e.data.i + compulsoryExams.length)  + "][credits] class=credits>";
                for (var j = credits; j > 0; j--) {
                    creditsHTML += "<option value=" + j + ">" + j + "</option>";
                }
                creditsHTML += "</select>";

                $(this).next("select").remove();
                $(this).after(creditsHTML);
                updateCounters();
            });
        }
    };

    var addFreeChoiceExams = function () {
        for (var i = 0; i < freeChoiceExams.length; i++) {
            var freeChoiceExam = freeChoiceExams[i];
            var year = freeChoiceExam["year"];

            var selector = "#proposalForm > ul:nth-of-type(" + year + ")";
            var selectHTML = "<select name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][exam_id] class=exam><option selected disabled>Un esame di Matematica a scelta</option>";
            for (var j = 0; j < exams.length; j++) {
                var exam = exams[j];
                selectHTML += "<option value=" + exam["id"] + ">" + exam["code"] + " — " + exam["name"] + " — " + exam["sector"] + "</option>";
            }
            selectHTML += "</select>";
            var $selectHTML = $(selectHTML);
            var deleteHTML = "<a class=delete></a>";

            $selectHTML.change({ i: i }, function (e) {
                var examId = $(this).val();
                var exam;
                // XXX(jacquerie): I apologize.
                for (var j = 0; j < exams.length; j++) {
                    if (exams[j]["id"] == examId) {
                        exam = exams[j];
                    }
                }

                var creditsHTML = "<select name=data[ChosenExam][" + (e.data.i + compulsoryGroups.length + compulsoryExams.length) + "][credits] class=credits>";
                if (exam["sector"] === "PROFIN") {
                        creditsHTML += "<option value=" + exam["credits"] + ">" + exam["credits"] + "</option>";
                } else {
                    for (var j = exam["credits"]; j > 0; j--) {
                        creditsHTML += "<option value=" + j + ">" + j + "</option>";
                    }
                }
                creditsHTML += "</select>";

                $(this).next("select").remove();
                $(this).after(creditsHTML);
                updateCounters();
            });

            $(selector).append($("<li>").append($selectHTML).append(deleteHTML));
        }
    };

    var addButtons = function () {
        var buttonsHTML = "<ul class=actions><li><a href=# class=newMathematicsExam>Aggiungi esame di Matematica</li><li><a href=# class=newFreeChoiceExam>Aggiungi esame a scelta libera</a></li></ul>";
        $("#proposalForm nav").append(buttonsHTML);

        $(".newMathematicsExam").click(function (e) {
            e.preventDefault();

            var i = compulsoryExams.length + compulsoryGroups.length + freeChoiceExams.length + lastExamAdded;
            var selectHTML = "<select name=data[ChosenExam][" + i + "][exam_id] class=exam><option selected disabled>Un esame di Matematica a scelta</option>";
            for (var j = 0; j < exams.length; j++) {
                var exam = exams[j];
                selectHTML += "<option value=" + exam["id"] + ">" + exam["code"] + " — " + exam["name"] + " — " + exam["sector"] + "</option>";
            }
            selectHTML += "</select>";
            var $selectHTML = $(selectHTML);

            $selectHTML.change({ i: i }, function (e) {
                var examId = $(this).val();
                var exam;
                // XXX(jacquerie): I apologize.
                for (var j = 0; j < exams.length; j++) {
                    if (exams[j]["id"] == examId) {
                        exam = exams[j];
                    }
                }

                var creditsHTML = "<select name=data[ChosenExam][" + e.data.i + "][credits] class=credits>";
                if (exam["sector"] === "PROFIN") {
                        creditsHTML += "<option value=" + exam["credits"] + ">" + exam["credits"] + "</option>";
                } else {
                    for (var j = exam["credits"]; j > 0; j--) {
                        creditsHTML += "<option value=" + j + ">" + j + "</option>";
                    }
                }
                creditsHTML += "</select>";

                $(this).next("select").remove();
                $(this).after(creditsHTML);
                updateCounters();
            });
            lastExamAdded++;

            var deleteHTML = "<a href=# class=delete></a>";

            $(this).closest("nav").next("hr").next("ul").append($("<li>").append($selectHTML).append(deleteHTML));
        });

        $(".newFreeChoiceExam").click(function (e) {
            e.preventDefault();

            var inputHTML = "<input name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][name] type=text placeholder='Un esame a scelta libera' class=exam></input>";
            var creditsHTML = "<input name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][credits] type=number min=1 class=credits></input>";
            var deleteHTML = "<a href=# class=delete></a>";
            lastFreeChoiceExamAdded++;

            $(this).closest("nav").next("hr").next("ul").append("<li>" + inputHTML + creditsHTML + deleteHTML + "</li>");
        });
    };

    var addCounters = function () {
        $("#proposalForm").on("change", ".credits", function () {
            updateCounters();
        });

        updateCounters();
    };

    var updateCounters = function () {
        $("h3 span").each(updateCounter);

        if ($(".creditsError").length == 0) {
            $("input[type=submit]").show();
        } else {
            $("input[type=submit]").hide();
        }
    };

    var updateCounter = function () {
        var result = 0;

        $(this).closest("h3").next("nav").next("hr").next("ul").each(function () {
            $(this).find(".credits").each(function () {
                var credits = parseInt($(this).val());
                result += isNaN(credits) ? 0 : credits;
            });
        });

        if (result < 60 || result > 60) {
            $(this).addClass("creditsError");
        } else {
            $(this).removeClass("creditsError");
        }

        $(this).html(result);
    };

    var addDeleteButtons = function () {
        $("#proposalForm").on("click", ".delete", function (e) {
            e.preventDefault();
            $(this).parent().remove();
            updateCounters();
        });
    };

    var addKonamiCode = function () {
        var status = 0;

        $("body").keydown(function (e) {
            if ((e.which === 38 && (status === 0 || status === 1))
            ||  (e.which === 40 && (status === 2 || status === 3))
            ||  (e.which === 37 && (status === 4 || status === 6))
            ||  (e.which === 39 && (status === 5 || status === 7))
            ||  (e.which === 66 && status === 8)) {
                status++;
            } else if (e.which === 65 && status === 9) {
                $("#content").append("<div class=nyanCat></div>");
                $(".nyanCat").fadeOut({
                    complete: function () { $(this).remove(); },
                    duration: 2500
                });
                status = 0;
            } else {
                status = 0;
            }
        });
    };
});
