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
        var baseHTML = "";
        for (i = 1; i <= degree['years']; i++) {
            baseHTML = baseHTML + "<hr class='proposal-year'>-<h3>" + year_title[i] +
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

                // If there is any note to show to the user, do this now. The note is also kept in display to make sure
                // that the user does not forgets about it.
                if (response['notes'] !== undefined && response['notes'] != null && response['notes'] != "") {
                    $('#proposalNotes').html(response['notes']);
                    alert(response['notes']);
                    $('#proposalNotes').slideDown('slow');
                }
                else {
                    $('#proposalNotes').html("");
                    $('#proposalNotes').hide();
                }

            }).catch((err) => {
                console.log(err);
                stop_loading();
            });
    }

    // Create an <option> tag describing the given exam, for insertion into a select.
    var createExamOption = function(exam) {
        return "<option value=" + exam["id"] + ">" + exam["code"] + " — " + exam["name"] +
            " — " + exam["sector"] + " — " + exam['credits'] + " CFU" + "</option>";
    };

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
            var examHTML = "<select name=data[ChosenExam][" + i + "][exam_id] class=exam>" + createExamOption(exam) + "</select>";
            var creditsHTML = "<input class=credits name=data[ChosenExam][" +
                i + "][credits] value=" + exam['credits'] + ' readonly>';

            // Add an hidden field with the ID of this compulsoryExam
            var compulsory_exam_id = "<input type=hidden name=data[ChosenExam][" + i + "][compulsory_exam_id] value=" + compulsoryExam["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + i + "][chosen_year] value=" + year + ">";

            $(selector).append("<li>" + examHTML + creditsHTML + compulsory_exam_id + year_input + "</li>");
        }
    };

    function get_group_with_id(groupId) {
        // XXX(jacquerie): I apologize.
        for (var j = 0; j < groups.length; j++) {
            if (groups[j].id == groupId) {
                return groups[j];
            }
        }  
    }

    var addCompulsoryGroups = function () {
        for (var i = 0; i < compulsoryGroups.length; i++) {
            var compulsoryGroup = compulsoryGroups[i];
            var groupId = compulsoryGroup["group_id"];
            var year = compulsoryGroup["year"];

            var group = get_group_with_id(groupId);

            var groupExams = group["exams"];
            var groupName = group["name"];

            var selector = "#proposalForm > ul:nth-of-type(" + year + ")";

            var groupHTML = "<option value='' disabled selected>Un esame a scelta nel gruppo " + groupName + "</option>"; // ATTENZIONE: groupName non viene sanificato
            var examsHTML = "";
            for (var j = 0; j < groupExams.length; j++) {
                examsHTML += createExamOption(groupExams[j]);
            }

            // Add an hidden field with the ID of this compulsoryGroup
            var compulsory_group_id = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryExams.length) + "][compulsory_group_id] value=" + compulsoryGroup["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryExams.length) + "][chosen_year] value=" + year + ">";

            $(selector).append("<li><select name=data[ChosenExam][" + (i + compulsoryExams.length) + "][exam_id] class='exam compulsory'>" + groupHTML + examsHTML + compulsory_group_id + year_input + "</li></select>");

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
        var creditsName = "data[ChosenExam][" + (i + compulsoryExams.length)  + "][credits]";
        var creditsHTML = "<input class=credits name=" + creditsName + " readonly value=" + credits + ">";

        el.next('input[name="' + creditsName + '"]').remove();
        $(el).after(creditsHTML);
        updateCounters();
    };

    var addFreeChoiceExams = function () {
        for (var i = 0; i < freeChoiceExams.length; i++) {
            var freeChoiceExam = freeChoiceExams[i];
            var year = freeChoiceExam["year"];

            var selector = "#proposalForm > ul:nth-of-type(" + year + ")";
            var selectHTML = "<select name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][exam_id] class=exam>";
            if (freeChoiceExam.group_id === null) {
                selectHTML += $("<option selected disabled></option>").text("Un esame a scelta");
                for (var j = 0; j < exams.length; j++) {
                    var exam = exams[j];
                    selectHTML += createExamOption(exam);
                }
            } else {
                var group = get_group_with_id(freeChoiceExam.group_id);
                selectHTML += "<option selected disabled>Un esame del gruppo " + group.name + "</option>"; // Attenzione! group.name non viene sanificato
                for (var j = 0; j < group.exams.length; j++) {
                    var exam = exams[j];
                    selectHTML += createExamOption(exam);
                }
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

        var creditsName = "data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][credits]";
        var creditsHTML = "<input readonly name=" + creditsName + " class=credits value=" + exam['credits'] + ">";

        el.next('input[name="' + creditsName + '"]').remove();
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
        var creditsName = "data[ChosenExam][" + i + "][credits]";
        var creditsHTML = "<input name=" + creditsName + " class=credits readonly value=" + exam['credits'] + ">";
        $('input[name="' + creditsName + '"]').remove();
        $(el).after(creditsHTML);
        updateCounters();
    };

    var addMathematicsExam = function(year, chosen_exam = null) {
        var i = compulsoryExams.length + compulsoryGroups.length + freeChoiceExams.length + lastExamAdded;

        var selectHTML = "<select name=data[ChosenExam][" + i + "][exam_id] class=exam><option selected disabled>Un esame a scelta</option>";
        for (var j = 0; j < exams.length; j++) {
            var exam = exams[j];
            selectHTML += createExamOption(exam);
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

        var inputHTML = "<input name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][name] required type=text placeholder='Un esame a scelta libera' class=exam value=" + name + "></input>";
        var creditsHTML = "<input name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][credits] type=number min=1 required class=credits value=" + credits + "></input>";
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
        var buttonsHTML = `<ul class="actions">` +
            `<li><a href="#" class="newMathematicsExam">Aggiungi esame di ${Caps['cds']}</li>` +
            `<li><a href="#" class="newFreeChoiceExam">Aggiungi esame a scelta libera</a></li>` +
            "</ul>";

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
        // This checks if each year in the plan has at most 60 credits. If one year
        // has strictly more than 60 credits, then a warning will be displayed.
        let creditCountPerYearOk = true;

        // This variable checks if the number of credits is enough to enable closing
        // the proposal, and submitting.
        let creditCountOk = false;

        // This variable tracks if double exams are found in the proposal
        let doubleExamsOk = true;

        // This variable tracks if all choices in groups have been selected
        let compulsoryChoicesOk = true;

        let creditCount = 0;
        let years = 0;

        $("#proposalWarning").hide();

        $("h3 span").each(function () {
            let thisYearCount = updateCounter(this);

            if (thisYearCount > 60) {
                creditCountPerYearOk = false;
            }

            creditCount += thisYearCount;
            years += 1;
        });

        creditCountOk = creditCount >= years * 60;

        let exams_ids = [];

        $('select.exam').each(function (j,e) {
            let this_id = parseInt(e.value);

            if (! isNaN(this_id)) {
                if (exams_ids.includes(this_id)) {
                    doubleExamsOk = false;
                }
                else {
                    exams_ids.push(this_id);
                }
            } else {
                if (e.classList.contains("compulsory")) {
                    compulsoryChoicesOk = false;
                }
            }
        });

        let text = "";

        if (! creditCountPerYearOk) {
            text = text + "<strong>Attenzione: </strong> il numero di crediti per anno è "
                + "superiore a 60. È comunque possibile chiudere il piano "
                + "di studi se si raggiunge il totale di crediti necessari, "
                + "ma si consiglia di ricontrollarlo attentamente "
                + "prima di procedere.<br><br>";
        }

        if (! doubleExamsOk) {
            text = text
                + '<strong>Attenzione: </strong> il piano di studi contiene esami ripetuti. '
                + 'Correggere prima della sottomisione.<br><br>';
        }

        if (! compulsoryChoicesOk) {
            text += 'Non sono state effettuate tutte le scelte obbligatorie.<br /><br />'
        }

        $('#proposalWarning').html(text);

        if (text != "") {
            $('#proposalWarning').show();
        }
        else {
            $('#proposalWarning').hide();
        }

        if (creditCountOk && doubleExamsOk && compulsoryChoicesOk) {
            enable_close_action();
        }
        else {
            disable_close_action();
        }
    };

    var updateCounter = function (elem) {
        var result = 0;

        $(elem).closest("h3").next("nav").next("hr").next("ul").each(function () {
            $(this).find(".credits").each(function () {
                var credits = parseInt($(this).val());
                result += isNaN(credits) ? 0 : credits;
            });
        });

        // Clean classes, so only one in creditsError or creditsWarning
        // is set at any time.
        $(elem).removeClass("creditsError");
        $(elem).removeClass("creditsWarning");


        if (result < 60) {
            $(elem).addClass("creditsError");
        } else if (result > 60) {
            $(elem).addClass("creditsWarning");


            $("#proposalWarning").show();
        }

        $(elem).html(result);

        return result;
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
            if (e.which === [38,38,40,40,37,39,37,39,66,65][status]) {
                if (++ status === 10) {
                    $("#content").append($("<div class=nyanCat></div>").fadeOut({
                        complete: function () { $(this).remove(); },
                        duration: 2500
                    }));
                    status = 0;
                }
            } else {
                status = 0;
            }
        });
    };

function enable_close_action() {
    $("input[class=\"submit-button\"]").prop('disabled', false);
}

function disable_close_action() {
    $("input[class=\"submit-button\"]").prop('disabled', true);
}

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

function on_submit_clicked(e) {
    if (! confirm(
            'Una volta sottomesso il piano, non sarà più possibile modificarlo, ' +
            'nè sottometterne di nuovi fino ad avvenuta approvazione.\n\n' +
            'Sottomettere definitivamente il piano?')) {
        e.preventDefault();
    }
}

$(document).ready(function () {
    $("input[type=submit]").hide();

    // Setup a confirmation dialog for the submission
    $('.submit-button').on('click', on_submit_clicked);

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
