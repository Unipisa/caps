const jQuery = require('jquery');

function caps_proposals_add() {

    var exams = undefined;
    var groups = undefined;
    var curricula = undefined;
    var cv_per_year = undefined;

    var compulsoryExams = undefined;
    var compulsoryGroups = undefined;
    var freeChoiceExams = undefined;
    var freeChoiceMessage = "";

    var lastExamAdded = 0;
    var lastFreeChoiceExamAdded = 0;

    var loadingCount = 0;
    var credits_per_year = [];

    var load_data_promise = Promise.all([
        jQuery.get(examsURL, (response) => {
            exams = response["exams"];
        }),
        jQuery.get(groupsURL, function (response) {
            groups = response["groups"];
        }),
        jQuery.get(curriculaURL, function (response) {
            curricula = response['curricula'];
        })
    ]);

    function on_curriculum_selected() {
        var curriculum = jQuery("#curriculum-id option:selected").text();
        var curriculumId = jQuery("#curriculum-id").val();
        if (curriculumId === "")
            return;

        var year = parseInt(jQuery('#academicYearSelect').val());

        var cvs = cv_per_year.get(year);
        var cv = undefined;
        for (var j = 0; j < cvs.length; j++) {
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

        jQuery("#proposalForm").hide();
        jQuery('#submit-block').hide();

        start_loading();

        jQuery.get(curriculumURL + cv['id'] + ".json").then(
            function (response) {
                compulsoryExams = response["compulsory_exams"];
                compulsoryGroups = response["compulsory_groups"];
                freeChoiceExams = response["free_choice_exams"];
                freeChoiceMessage = response["degree"]["free_choice_message"];
                credits_per_year = response.credits;

                for (var i = 1; i <= degree['years']; i++) {
                    baseHTML = baseHTML + `
          <div class="row my-2">
            <div class="col-12">
              <div class="card shadow">
                <div class="card-header bg-primary">
                  <div class="d-flex justify-content-between align-content-center">
                    <h3 class="h5 text-white">${year_title[i]}</h3>
                     <div class="h5 text-white">Crediti: <span class="credit-block" id="credit-block-${i}"></span>/${credits_per_year[i - 1]}</div>
                     </div>
    
                  </div>
                <div class="card-body">
                  <nav id="nav-year-${i}"></nav>
                    <ul id="ul-year-${i}" class="p-1"></ul>
                </div>
              </div>
            </div>
          </div>
          `;
                }

                jQuery("#proposalForm").html(baseHTML);

                addCompulsoryExams();
                addCompulsoryGroups();
                addFreeChoiceExams();
                addButtons();
                addCounters();
                addDeleteButtons();

                if (proposal['chosen_exams'] !== undefined) {
                    loadAdditionalExams();
                }

                jQuery("#proposalForm").slideDown();
                jQuery('#submit-block').slideDown();

                jQuery("input[type=submit]").show();
                updateCounters();
                stop_loading();

                // If there is any note to show to the user, do this now. The note is also kept in display to make sure
                // that the user does not forgets about it.
                if (response['notes'] !== undefined && response['notes'] != null && response['notes'] != "") {
                    jQuery('#proposalNotes').html(response['notes']);
                    alert(response['notes']);
                    jQuery('#proposalNotes').slideDown('slow');
                }
                else {
                    jQuery('#proposalNotes').html("");
                    jQuery('#proposalNotes').hide();
                }

            }).catch((err) => {
                console.log(err);
                stop_loading();
            });
    }

    // Create an <option> tag describing the given exam, for insertion into a select.
    var createExamOption = function (exam) {
        return "<option value=" + exam["id"] + ">" + exam["code"] + " — " + exam["name"] +
            " — " + exam["sector"] + " — " + exam['credits'] + " CFU" + "</option>";
    };

    var loadAdditionalExams = function () {
        // We only need to add exams that are not linked to a requirement, as the others have already been loaded in the
        // corresponding select and input forms at this point.
        for (var j = 0; j < proposal['chosen_exams'].length; j++) {
            var exam = proposal['chosen_exams'][j];
            if (exam['compulsory_exam_id'] === null &&
                exam['compulsory_group_id'] === null &&
                exam['free_choice_exam_id'] === null) {
                addMathematicsExam(exam['chosen_year'], exam);
            }
        }

        for (var j = 0; j < proposal['chosen_free_choice_exams'].length; j++) {
            var exam = proposal['chosen_free_choice_exams'][j];
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

            var selector = `#ul-year-${year}`;
            var examHTML = "<div class='col-9'><select name=data[ChosenExam][" + i + "][exam_id] class='exam form-control'>" + createExamOption(exam) + "</select></div>";
            var creditsHTML = "<div class='col-3'><input class='credits form-control' name=data[ChosenExam][" +
                i + "][credits] value=" + exam['credits'] + ' readonly></div>';

            // Add an hidden field with the ID of this compulsoryExam
            var compulsory_exam_id = "<input type=hidden name=data[ChosenExam][" + i + "][compulsory_exam_id] value=" + compulsoryExam["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + i + "][chosen_year] value=" + year + ">";

            jQuery(selector).append("<li class='form-group row'>" + examHTML + creditsHTML + compulsory_exam_id + year_input + "</li>");
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

            var selector = `#ul-year-${year}`;

            var groupHTML = "<option value='' disabled selected>Un esame a scelta nel gruppo " + groupName + "</option>"; // ATTENZIONE: groupName non viene sanificato
            var examsHTML = "";
            for (var j = 0; j < groupExams.length; j++) {
                examsHTML += createExamOption(groupExams[j]);
            }

            // Add an hidden field with the ID of this compulsoryGroup
            var compulsory_group_id = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryExams.length) + "][compulsory_group_id] value=" + compulsoryGroup["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryExams.length) + "][chosen_year] value=" + year + ">";

            jQuery(selector).append("<li class='row form-group'>" +
                "<div class='col-9'><select name=data[ChosenExam][" + (i + compulsoryExams.length) + "][exam_id] class='form-control exam compulsory'></div>"
                + groupHTML + examsHTML + compulsory_group_id + year_input + "</li></select>");

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
            jQuery(selector + " li select:last").change(() => onCompulsoryGroupSelected(local_i));
        }
    };

    var getCompulsoryGroupSelect = function (i) {
        return jQuery('select[name="data[ChosenExam][' + (i + compulsoryExams.length) + '][exam_id]"]');
    };

    var onCompulsoryGroupSelected = function (i) {
        var el = getCompulsoryGroupSelect(i);
        var examId = jQuery(el).val();
        var exam;
        // XXX(jacquerie): I apologize.
        for (var j = 0; j < exams.length; j++) {
            if (exams[j]["id"] == examId) {
                exam = exams[j];
            }
        }

        var credits = exam["credits"];
        var creditsName = "data[ChosenExam][" + (i + compulsoryExams.length) + "][credits]";
        var creditsHTML = "<div class='col-3'><input class=\"credits form-control\" name=" + creditsName + " readonly value=" + credits + "></div>";

        el.parent().next('div[class="col-3"]').remove();
        jQuery(el).parent().after(creditsHTML);
        updateCounters();
    };

    var addFreeChoiceExams = function () {
        for (var i = 0; i < freeChoiceExams.length; i++) {
            var freeChoiceExam = freeChoiceExams[i];
            var year = freeChoiceExam["year"];

            var selector = `#ul-year-${year}`;
            var selectHTML = "<div class='col-9'><select class=\"form-control exam\" name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][exam_id]></div>";
            if (freeChoiceExam.group_id === null) {
                selectHTML += "<option selected disabled>Un esame a scelta</option>";
                for (var j = 0; j < exams.length; j++) {
                    var exam = exams[j];
                    selectHTML += createExamOption(exam);
                }
            } else {
                var group = get_group_with_id(freeChoiceExam.group_id);
                selectHTML += "<option selected disabled>Un esame del gruppo " + group.name + "</option>"; // Attenzione! group.name non viene sanificato
                for (var j = 0; j < group.exams.length; j++) {
                    var exam = group.exams[j];
                    selectHTML += createExamOption(exam);
                }
            }
            selectHTML += "</select>";
            var $selectHTML = jQuery(selectHTML);
            var deleteHTML = "<div class='col-1 my-auto'><a href='#' class='delete fas fw fa-trash'></a></div>";

            let local_i = i;
            $selectHTML.change(() => onFreeChoiceExamSelected(local_i));

            // Add an hidden field with the ID of this free choice exam
            var free_choice_exam_id = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][free_choice_exam_id] value=" + freeChoiceExam["id"] + ">";

            // Store the year for this exam as well
            var year_input = "<input type=hidden name=data[ChosenExam][" + (i + compulsoryGroups.length + compulsoryExams.length) + "][chosen_year] value=" + year + ">";

            jQuery(selector).append(jQuery("<li class='row form-group'>").append($selectHTML).append(free_choice_exam_id).append(year_input).append(deleteHTML));

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

    var onFreeChoiceExamSelected = function (i) {
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
        var creditsHTML = "<div class='col-2'><input readonly name=" + creditsName + " class='form-control credits' value=" + exam['credits'] + "></div>";

        el.parent().next('div[class="col-2"]').remove();
        el.parent().after(creditsHTML);
        updateCounters();
    };

    var getFreeChoiceExamSelect = function (i) {
        return jQuery('select[name="data[ChosenExam][' + (i + compulsoryGroups.length + compulsoryExams.length) + '][exam_id]"]');
    };

    var getMathematicsExamSelect = function (i) {
        return jQuery('select[name="data[ChosenExam][' + i + '][exam_id]"]');
    }

    var onMathematicsExamChosen = function (i) {
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
        var creditsHTML = "<div class='col-2'><input name=" + creditsName + " class='form-control credits' readonly value=" + exam['credits'] + "></div>";
        el.parent().next('div[class="col-2"]').remove();
        jQuery(el).parent().after(creditsHTML);
        updateCounters();

        if (exam['notes'] != null) {
            var ex_msg = "<div class=\"col-9 mt-1 small text-muted\">" +
                exam['notes'] +
                "</div>";
        }
    };

    var addMathematicsExam = function (year, chosen_exam = null) {
        var i = compulsoryExams.length + compulsoryGroups.length + freeChoiceExams.length + lastExamAdded;

        var selectHTML = "<div class='col-9'><select class=\"form-control exam\" name=data[ChosenExam][" + i + "][exam_id]><option selected disabled>Un esame a scelta</option></div>";
        for (var j = 0; j < exams.length; j++) {
            var exam = exams[j];
            selectHTML += createExamOption(exam);
        }
        selectHTML += "</select></div>";
        var $selectHTML = jQuery(selectHTML);

        let local_i = i;
        $selectHTML.change(() => onMathematicsExamChosen(local_i));

        // This ID is used in the closure to set up the correct year.
        var thisExamID = i;
        lastExamAdded++;

        var deleteHTML = "<div class='col-1 my-auto'><a href='#' class='delete fas fw fa-trash'></a></div>";

        jQuery("nav#nav-year-" + year).each((j, nav) => {
            var year_input = "<input type=hidden name=data[ChosenExam][" +
                thisExamID + "][chosen_year] value=" + year + ">";

            deleteHTML = year_input + deleteHTML;

            jQuery(`#ul-year-${year}`).append(jQuery("<li class='row form-group'>").append($selectHTML).append(deleteHTML));
        });

        if (chosen_exam != null) {
            getMathematicsExamSelect(i).val(chosen_exam['exam_id']);
            onMathematicsExamChosen(i);
        }

    };

    var addFreeChoiceExam = function (year, exam = null) {
        if (exam != null) {
            var name = exam['name'];
            var credits = exam['credits'];
        }
        else {
            var name = "";
            var credits = "";
        }

        var inputHTML = "<div class='col-9'>" +
            "<input class=\"form-control exam\" name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][name] required type=text placeholder='Un esame a scelta libera' value=\"" + name + "\"></input>" +
            "</div>";
        var creditsHTML = "<div class='col-2'><input class=\"form-control credits\" name=data[ChosenFreeChoiceExam][" + lastFreeChoiceExamAdded + "][credits] type=number min=1 required value=" + credits + "></input></div>";
        var deleteHTML = "<div class='col-1 my-auto'><a href='#' class='delete fas fw fa-trash'></a></div>";

        // This ID is used in the closure to set up the correct year.
        var thisExamID = lastFreeChoiceExamAdded;

        jQuery("nav#nav-year-" + year).each((j, nav) => {
            var year_input = "<input class=\"form-control\" type=hidden name=data[ChosenFreeChoiceExam][" +
                thisExamID + "][chosen_year] value=" + year + ">";

            inputHTML = inputHTML + year_input;

            var fc_msg = "";
            if (freeChoiceMessage !== undefined && freeChoiceMessage != null && freeChoiceMessage != "") {
                fc_msg = "<div class=\"col-9 mt-1 small text-muted\">" +
                    freeChoiceMessage +
                    "</div>"
            }

            jQuery(`#ul-year-${year}`).append("<li class='form-group row'>" +
                inputHTML + creditsHTML + deleteHTML + fc_msg +
                "</li>");
        });

        lastFreeChoiceExamAdded++;
    };

    var addButtons = function () {
        var buttonsHTML = `<div class="d-flex mb-4">
      <div class="flex-fill"></div>
      <a href="#" class="newMathematicsExam"><button type="button" class="btn-primary btn btn-sm mr-2">Aggiungi esame di ${Caps['cds']}</button></a>
      <a href="#" class="newFreeChoiceExam"><button type="button" class="btn-primary btn btn-sm">Aggiungi esame a scelta libera</button></a>
      </div>`;

        jQuery("#proposalForm nav").append(buttonsHTML);

        jQuery(".newMathematicsExam").click(function (e) {
            e.preventDefault();
            var year = jQuery(this).closest('nav').attr('id').split('-')[2];
            addMathematicsExam(year);
        });

        jQuery(".newFreeChoiceExam").click(function (e) {
            e.preventDefault();
            var year = jQuery(this).closest('nav').attr('id').split('-')[2];
            addFreeChoiceExam(year);
        });
    };

    var addCounters = function () {
        jQuery("#proposalForm").on("change", ".credits", function () {
            updateCounters();
        });

        updateCounters();
    };

    var updateCounters = function () {
        // This variable checks if the number of credits is enough to enable closing
        // the proposal, and submitting.
        var creditCountOk = false;

        // This variable tracks if double exams are found in the proposal
        var doubleExamsOk = true;

        // This variable tracks if all choices in groups have been selected
        var compulsoryChoicesOk = true;

        var creditCount = 0;
        var years = 0;

        jQuery("#proposalWarning").hide();

        var elems = document.getElementsByClassName('credit-block');
        for (var i = 0; i < elems.length; i++) {
            var thisYearCount = updateCounter(elems[i]);
            creditCount += thisYearCount;
            years += 1;
        }

        creditCountOk = creditCount >= credits_per_year.reduce((a, b) => a + b); // years * 60;

        var exams_ids = [];

        jQuery('select.exam').each(function (j, e) {
            var this_id = parseInt(e.value);

            if (!isNaN(this_id)) {
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

        var text = "";

        if (!doubleExamsOk) {
            text = text
                + '<strong>Attenzione: </strong> il piano di studi contiene esami ripetuti. '
                + 'Correggere prima della sottomisione.<br><br>';
        }

        if (!compulsoryChoicesOk) {
            text += 'Non sono state effettuate tutte le scelte obbligatorie.<br /><br />'
        }

        jQuery('#proposalWarning').html(text);

        if (text != "") {
            jQuery('#proposalWarning').show();
        }
        else {
            jQuery('#proposalWarning').hide();
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

        // Fetch all the elements with class credits inside
        // the current block
        var year = elem.id.split("-")[2];
        var nav_elem = document.getElementById(`ul-year-${year}`);
        var credits_elems = nav_elem.getElementsByClassName('credits');

        for (var i = 0; i < credits_elems.length; i++) {
            var credits = parseInt(jQuery(credits_elems[i]).val());
            result += isNaN(credits) ? 0 : credits;
        }

        // Clean classes, so only one in creditsError or creditsWarning
        // is set at any time.
        jQuery(elem).removeClass("text-danger");
        jQuery(elem).removeClass("text-warning");

        if (result < credits_per_year[year - 1]) {
            jQuery(elem).addClass("text-danger");
        } else if (result > credits_per_year[year - 1]) {
            jQuery(elem).addClass("text-warning");

            jQuery("#proposalWarning").show();
        }

        jQuery(elem).html(result);

        return result;
    };

    var addDeleteButtons = function () {
        jQuery("#proposalForm").on("click", ".delete", function (e) {
            e.preventDefault();
            jQuery(this).parent().parent().remove();
            updateCounters();
        });
    };

    function enable_close_action() {
        jQuery("#submit-button").prop('disabled', false);
    }

    function disable_close_action() {
        jQuery("#submit-button").prop('disabled', true);
    }

    function start_loading() {
        loadingCount++;
        jQuery('#loadingIcon').show();
    }

    function stop_loading() {
        if (--loadingCount == 0) {
            jQuery('#loadingIcon').hide();
        }
    }

    function load_proposal(proposal) {
        console.log("CAPS :: Loading proposal with ID = " + proposal["id"]);

        // Set the correct Curriculum
        addAcademicYearInput();
        jQuery('#academicYearSelect').val(proposal['curriculum']['academic_year']);
        on_academic_year_selected();
        jQuery("#curriculum-id").val(proposal["curriculum_id"]);
        jQuery("#completeForm").show();
        on_curriculum_selected();
    }

    function addAcademicYearInput() {
        console.log("CAPS :: Adding selection of academic year");

        // Groups CV by academic_years
        cv_per_year = new Map();

        for (var j = 0; j < curricula.length; j++) {
            var year = curricula[j].degree.academic_year;
            if (cv_per_year.has(year)) {
                cv_per_year.get(year).push(curricula[j]);
            }
            else {
                cv_per_year.set(year, [curricula[j]]);
            }
        }

        // Add the options, sort the years descending
        var options_html = "<option value=text>Anno di immatricolazione</option>";
        var cv_keys = Array.from(cv_per_year.keys()).sort((a, b) => b - a);
        cv_keys.forEach(function (year, idx) {
            var opt = "<option value=" + year + ">" + year + "/" + (year + 1) + "</option>";
            options_html = options_html + opt;
        });

        var year_selection_html = jQuery(
            "<div class='form-group'>" +
            "<select class='form-control' name=academic_year id='academicYearSelect'>" + options_html + "</select></div>"
        );
        jQuery('#curriculum-select').append(year_selection_html);
        jQuery("#academicYearSelect").change(on_academic_year_selected);
    }

    function on_academic_year_selected() {
        var year = parseInt(jQuery('#academicYearSelect').val());

        // Clear any previous form that might have been loaded
        jQuery('#curriculum-id').remove();
        jQuery('#curriculum-id-label').remove();
        jQuery('#proposalForm').hide();
        jQuery('#submit-block').hide();

        // Create the form for the curriculum choice
        var options = "<option value=text>Selezionare il curriculum</option>";
        cv_per_year.get(year).forEach(function (cv, j) {
            options = options +
                "<option value=" + cv['id'] + ">" +
                cv['degree']['name'] + " — Curriculum " + cv['name'] + "</option>";
        });

        var curriculum_select_html =
            "<div class='form-group'>" +
            "<select class='form-control' name=curriculum_id id=curriculum-id>" +
            options +
            "</select></div>";

        jQuery('#curriculum-select').append(curriculum_select_html);
        jQuery('#curriculum-id').change(on_curriculum_selected);
    }

    function on_submit_clicked(e) {
        if (!confirm(
            'Una volta sottomesso il piano, non sarà più possibile modificarlo, ' +
            'nè sottometterne di nuovi fino ad avvenuta approvazione.\n\n' +
            'Sottomettere definitivamente il piano?')) {
            e.preventDefault();
        }
    }

    jQuery("input[type=submit]").hide();
    jQuery('#submit-block').hide();

    // Setup a confirmation dialog for the submission
    jQuery('#submit-button').on('click', on_submit_clicked);

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
            jQuery("#completeForm").show();
            stop_loading();
        }
    }, function (err) {
        console.log("Error loading data");
        stop_loading();
    });

} // End of function caps_proposals_add

module.exports = caps_proposals_add;