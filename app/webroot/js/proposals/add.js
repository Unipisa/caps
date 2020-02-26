var exams = undefined;
var groups = undefined;
var curricula = undefined;
var cv_per_year = undefined;

var compulsoryExams = undefined;
var compulsoryGroups = undefined;
var freeChoiceExams = undefined;

var lastExamAdded = 0;
var lastFreeChoiceExamAdded = 0;

var loadingCount = 0;

var load_data_promise = Promise.all([
    $.get(examsURL, (response) => {
        exams = response["exams"];
    }),
    $.get(groupsURL, function (response) {
        groups = response["groups"];
    }),
    $.get(curriculaURL, function (response) {
        curricula = response['curricula'];
    })
]);

function on_curriculum_selected() {
        var curriculum = $("#curriculum-id option:selected").text();
        var curriculumId = $("#curriculum-id").val();
        if (curriculumId === "")
            return;

        var year = parseInt($('#academicYearSelect').val());

        let cvs = cv_per_year.get(year);
        var cv = undefined;
        for (j = 0; j < cvs.length; j++) {
            if (cvs[j]['id'] == curriculumId) {
                cv = cvs[j];
                break;
            }
        }

        var degree = cv['degree'];
        var year_title = {
            1: 'Primo anno',
            2: 'Secondo anno',
            3: 'Terzo anno'
        };
        var baseHTML = "<hr>";
        for (i = 1; i <= degree['years']; i++) {
            baseHTML = baseHTML + "<h3>" + year_title[i] +
                " <span></span>/60</h3><nav id=\"nav-year-" + i + "\"></nav><hr><ul></ul>";
        }

        $("#proposalForm").hide();

        start_loading();

        $.get(curriculumURL + cv['id'] + ".json").then(
            function (response) {
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

                if (proposal['chosen_exams'] !== undefined) {
                    loadAdditionalExams();
                }

                $("#proposalForm").slideDown();

                $("input[type=submit]").show();
                updateCounters();

                stop_loading();
            }).catch((err) => {
                console.log(err);
                stop_loading();
            });
    }

    var loadAdditionalExams = function() {
        // We only need to add exams that are not linked to a requirement, as the others have already been loaded in the
        // corresponding select and input forms at this point.
        for (j = 0; j < proposal['chosen_exams'].length; j++) {
            let exam = proposal['chosen_exams'][j];
            if (exam['compulsory_exam_id'] === null &&
                exam['compulsory_group_id'] === null &&
                exam['free_choice_exam_id'] === null) {
                addMathematicsExam(exam['chosen_year'], exam);
            }
        }

        for (j = 0; j < proposal['chosen_free_choice_exams'].length; j++) {
            let exam = proposal['chosen_free_choice_exams'][j];
            addFreeChoiceExam(exam['chosen_year'], exam);
        }

        updateCounters();
    };

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
            var creditsHTML = "<input class=credits name=data[ChosenExam][" +
                i + "][credits] value=" + exam['credits'] + ' readonly>';

            // Add an hidden field with the ID of this compulsoryExam
            var compulsory_exam_id = "<input type=hidden name=data[ChosenExam][" + i + "][compulsory_exam_id] value=" + compulsoryExam["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + i + "][chosen_year] value=" + year + ">";

            $(selector).append("<li>" + examHTML + creditsHTML + compulsory_exam_id + year_input + "</li>");
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

            // Add an hidden field with the ID of this compulsoryGroup
            var compulsory_group_id = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryExams.length) + "][compulsory_group_id] value=" + compulsoryGroup["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryExams.length) + "][chosen_year] value=" + year + ">";

            $(selector).append("<li><select name=data[ChosenExam][" + (i + compulsoryExams.length) + "][exam_id] class=exam>" + groupHTML + examsHTML + compulsory_group_id + year_input + "</li></select>");

            // If this is a draft proposal, then we need to find the selection for this group, if any.
            if (proposal['chosen_exams'] !== undefined) {
                for (var j = 0; j < proposal['chosen_exams'].length; j++) {
                    if (proposal['chosen_exams'][j]['compulsory_group_id'] == compulsoryGroup['id'] && proposal['chosen_exams'][j]['exam_id'] != null) {
                        getCompulsoryGroupSelect(i).val(proposal['chosen_exams'][j]['exam_id']);
                        onCompulsoryGroupSelected(i);
                    }
                }
            }

            let local_i = i;
            $(selector + " li select:last").change(() => onCompulsoryGroupSelected(local_i));
        }
    };

    var getCompulsoryGroupSelect = function(i) {
        return $('select[name="data[ChosenExam][' +  (i + compulsoryExams.length) + '][exam_id]"]');
    };

    var onCompulsoryGroupSelected = function(i) {
        var el = getCompulsoryGroupSelect(i);
        var examId = $(el).val();
        var exam;
        // XXX(jacquerie): I apologize.
        for (var j = 0; j < exams.length; j++) {
            if (exams[j]["id"] == examId) {
                exam = exams[j];
            }
        }

        var credits = exam["credits"];
        var creditsHTML = "<input class=credits name=data[ChosenExam][" +
            (i + compulsoryExams.length)  +
            "][credits] readonly value=" + credits + ">";

        el.next('input[class="credits"]').remove();
        $(el).after(creditsHTML);
        updateCounters();
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

            let local_i = i;
            $selectHTML.change(() => onFreeChoiceExamSelected(local_i));

            // Add an hidden field with the ID of this free choice exam
            var free_choice_exam_id = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][free_choice_exam_id] value=" + freeChoiceExam["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][chosen_year] value=" + year + ">";

            $(selector).append($("<li>").append($selectHTML).append(free_choice_exam_id).append(year_input).append(deleteHTML));

            // If this is a draft proposal, then we need to find the selection for this group, if any.
            if (proposal['chosen_exams'] !== undefined) {
                for (var j = 0; j < proposal['chosen_exams'].length; j++) {
                    if (proposal['chosen_exams'][j]['free_choice_exam_id'] == freeChoiceExam['id'] && proposal['chosen_exams'][j]['exam_id'] != null) {
                        getFreeChoiceExamSelect(i).val(proposal['chosen_exams'][j]['exam_id']);
                        onFreeChoiceExamSelected(i);
                    }
                }
            }
        }
    };

    var onFreeChoiceExamSelected = function(i) {
        var el = getFreeChoiceExamSelect(i);
        var examId = el.val();
        var exam;
        // XXX(jacquerie): I apologize.
        for (var j = 0; j < exams.length; j++) {
            if (exams[j]["id"] == examId) {
                exam = exams[j];
            }
        }

        var creditsHTML = "<input readonly name=data[ChosenExam][" +
            (i + compulsoryGroups.length + compulsoryExams.length) +
            "][credits] class=credits value=" + exam['credits'] + ">";

        el.next('input[class="credits"]').remove();
        el.after(creditsHTML);
        updateCounters();
    };

    var getFreeChoiceExamSelect = function(i) {
        return $('select[name="data[ChosenExam][' +  (i + compulsoryGroups.length + compulsoryExams.length) + '][exam_id]"]');
    };

    var getMathematicsExamSelect = function(i) {
        return $('select[name="data[ChosenExam][' + i + '][exam_id]"]');
    }

    var onMathematicsExamChosen = function(i) {
        var el = getMathematicsExamSelect(i);
        var examId = el.val();
        var exam;
        // XXX(jacquerie): I apologize.
        for (var j = 0; j < exams.length; j++) {
            if (exams[j]["id"] == examId) {
                exam = exams[j];
            }
        }

        var creditsHTML = "<input name=data[ChosenExam][" + i + "][credits] class=credits readonly value=" + exam['credits'] + ">";

        $(el).next("select").remove();
        $(el).after(creditsHTML);
        updateCounters();
    };

    var addMathematicsExam = function(year, chosen_exam = null) {
        var i = compulsoryExams.length + compulsoryGroups.length + freeChoiceExams.length + lastExamAdded;

        var selectHTML = "<select name=data[ChosenExam][" + i + "][exam_id] class=exam><option selected disabled>Un esame di Matematica a scelta</option>";
        for (var j = 0; j < exams.length; j++) {
            var exam = exams[j];
            selectHTML += "<option value=" + exam["id"] + ">" + exam["code"] + " — " + exam["name"] + " — " + exam["sector"] + "</option>";
        }
        selectHTML += "</select>";
        var $selectHTML = $(selectHTML);

        let local_i = i;
        $selectHTML.change(() => onMathematicsExamChosen(local_i));

        // This ID is used in the closure to set up the correct year.
        let thisExamID = i;
        lastExamAdded++;

        var deleteHTML = "<a href=# class=delete></a>";

        $("nav#nav-year-" + year).each((j, nav) => {
            // Read the year from the ID
            // year = $(nav).attr('id').split('-')[2];

            var year_input = "<input type=hidden name=data[ChosenExam][" +
                thisExamID + "][chosen_year] value=" + year + ">";

            deleteHTML = year_input + deleteHTML;

            $(nav).next("hr").next("ul").append($("<li>").append($selectHTML).append(deleteHTML));
        });

        if (chosen_exam != null) {
            getMathematicsExamSelect(i).val(chosen_exam['exam_id']);
            onMathematicsExamChosen(i);
        }

    };

    var addFreeChoiceExam = function(year, exam = null) {
        if (exam != null) {
            var name = exam['name'];
            var credits = exam['credits'];
        }
        else {
            var name = "";
            var credits = "";
        }

        var inputHTML = "<input name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][name] type=text placeholder='Un esame a scelta libera' class=exam value=" + name + "></input>";
        var creditsHTML = "<input name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][credits] type=number min=1 class=credits value=" + credits + "></input>";
        var deleteHTML = "<a href=# class=delete></a>";

        // This ID is used in the closure to set up the correct year.
        let thisExamID = lastFreeChoiceExamAdded;

        $("nav#nav-year-" + year).each((j, nav) => {
            // Read the year from the ID
            // year = $(nav).attr('id').split('-')[2];

            var year_input = "<input type=hidden name=data[ChosenFreeChoiceExam][" +
                thisExamID + "][chosen_year] value=" + year + ">";

            inputHTML = inputHTML + year_input;

            $(nav).next("hr").next("ul").append("<li>" + inputHTML + creditsHTML + deleteHTML + "</li>");
        });

        lastFreeChoiceExamAdded++;
    };

    var addButtons = function () {
        var buttonsHTML = "<ul class=actions><li><a href=# class=newMathematicsExam>Aggiungi esame di Matematica</li><li><a href=# class=newFreeChoiceExam>Aggiungi esame a scelta libera</a></li></ul>";
        $("#proposalForm nav").append(buttonsHTML);

        $(".newMathematicsExam").click(function (e) {
            e.preventDefault();
            year = $(this).closest('nav').attr('id').split('-')[2];
            addMathematicsExam(year);
        });

        $(".newFreeChoiceExam").click(function (e) {
            e.preventDefault();
            year = $(this).closest('nav').attr('id').split('-')[2];
            addFreeChoiceExam(year);
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
            $("input[class=\"submit-button\"]").show();
        } else {
            $("input[class=\"submit-button\"]").hide();
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

        // Clean classes, so only one in creditsError or creditsWarning
        // is set at any time.
        $(this).removeClass("creditsError");
        $(this).removeClass("creditsWarning");

        $("#proposalWarning").hide();

        if (result < 60) {
            $(this).addClass("creditsError");
        } else if (result > 60) {
            $(this).addClass("creditsWarning");

            $("#proposalWarning").html(
                "<strong>Attenzione</strong>: il numero di crediti per anno è "
                + "superiore a 60. È comunque possibile chiudere il piano "
                + "di studi, ma si consiglia di ricontrollarlo attentamente "
                + "prima di procedere.");
            $("#proposalWarning").show();
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

function start_loading() {
    loadingCount++;
    $('#loadingIcon').show();
}

function stop_loading() {
    if (--loadingCount == 0) {
        $('#loadingIcon').hide();
    }
}

function load_proposal(proposal) {
    console.log("CAPS :: Loading proposal with ID = " + proposal["id"]);

    // Set the correct Curriculum
    addAcademicYearInput();
    $('#academicYearSelect').val(proposal['curriculum']['academic_year']);
    on_academic_year_selected();
    $("#curriculum-id").val(proposal["curriculum_id"]);
    $("#completeForm").show();
    on_curriculum_selected();
}

function addAcademicYearInput() {
    console.log("CAPS :: Adding selection of academic year");

    // Groups CV by academic_years
    cv_per_year = new Map;

    for (j = 0; j < curricula.length; j++) {
        let year = curricula[j].academic_year;
        if (cv_per_year.has(year)) {
            cv_per_year.get(year).push(curricula[j]);
        }
        else {
            cv_per_year.set(year, [ curricula[j] ]);
        }
    }

    // Add the options, sort the years descending
    var options_html = "<option value=text>Anno di immatricolazione</option>";
    var cv_keys = Array.from(cv_per_year.keys()).sort((a,b) => b - a);
    cv_keys.forEach(function (year, idx) {
        var opt = "<option value=" + year + ">" + year + "/" + (year + 1) + "</option>";
        options_html = options_html + opt;
    });

    var year_selection_html = $(
        "<select name=academic_year id='academicYearSelect'>" + options_html + "</select>"
    );
    $('#curriculum-select').append(year_selection_html);
    $("#academicYearSelect").change(on_academic_year_selected);
}

function on_academic_year_selected() {
    var year = parseInt($('#academicYearSelect').val());

    // Clear any previous form that might have been loaded
    $('#curriculum-id').remove();
    $('#curriculum-id-label').remove();
    $('#proposalForm').hide();

    // Create the form for the curriculum choice
    var options = "<option value=text>Selezionare il curriculum</option>";
    cv_per_year.get(year).forEach(function (cv, j) {
        options = options +
            "<option value=" + cv['id'] + ">" +
            cv['degree']['name'] + " — Curriculum " + cv['name'] + "</option>";
    });

    var curriculum_select_html =
        "<select name=curriculum_id id=curriculum-id>" +
        options +
        "</select>";

    $('#curriculum-select').append(curriculum_select_html);
    $('#curriculum-id').change(on_curriculum_selected);
}

$(document).ready(function () {
    $("input[type=submit]").hide();

    start_loading();

    // Only show the form to select the plan if there is not ID, otherwise it
    // will be loaded in the background and shown afterwards.
    load_data_promise.then(function () {
        if (proposal["id"] !== undefined) {
            load_proposal(proposal);
            stop_loading();
        }
        else {
            addAcademicYearInput();
            $("#completeForm").show();
            stop_loading();
        }
    }, function (err) {
        console.log("Error loading data");
        stop_loading();
    });
});
