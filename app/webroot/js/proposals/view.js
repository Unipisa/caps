/*
variables defined in html file:

proposal_json
examsURL
*/

var caps;
class Caps {
    constructor(json) {
        this.json = json;
        this.exams = null;
        this.id_group = null;
        this.MAX_ID = 2000000000; // ids greater than this are used for new objects
        this.new_id_count = this.MAX_ID;
    }

    get_exams() {
        var self = this;
        if (this.exams != null) return Promise.resolve(this.exams);
        return $.get(self.json.examsURL).then(function(response) {
            self.exams = response["exams"];
            return self.exams;
        });
    }

    get_group_exams(group_id) {
        var self = this;
        if (this.id_group != null) return Promise.resolve(this.id_group[group_id]);
        return $.get(self.json.groupsURL).then(function(response) {
            self.id_group = {};            
            response["groups"].forEach(function (group) {
                self.id_group[group.id] = group.exams;                
            });
            return self.id_group[group_id];
        });
    }

    get_new_id() {
        this.new_id_count++;
        return this.new_id_count;
    }
}

function $option_for_exam(exam) {
    return $("<option></option>").attr("value", exam.id).text(exam.code + " — " + exam.name + " " + exam.sector + " — " + exam.credits + " CFU");
}

function compare_arrays(a, b) {
    for (var i = 0; i < a.length && i < b.length; ++i) {
        if (a[i] == b[i]) continue;
        if (a[i] < b[i]) return -1;
        else return 1;
    }
    return a.length - b.length;
}

class Exam {
    constructor(exam_json) {
        // exam_json può rappresentare un ChosenExam oppure un ChosenFreeChoiceExam
        this.json = exam_json;
        this.update();
    }

    update() {
        var e = this.json;
        this.is_custom = false;
        this.is_empty = false;
        if (e.exam_id != null) {
            this.id = "E" + this.json.id; // choosen exam
            e = e.exam;
        } else if (this.json.name != null) {
            this.is_custom = true;
            this.id = "F" + this.json.id; // choosen free_choice_exam
        } else {
            // esame a scelta libera ancora da inserire
            this.id = "X" + this.json.id; 
            this.is_empty = true;
        }
        this.credits = e.credits;
        this.code = e.code;
        this.name = e.name;
        this.sector = e.sector;
        this.credits = e.credits;
        this.tags = e.tags ? e.tags : [];
        this.chosen_year = this.json.chosen_year;
           
        if (this.json.compulsory_exam_id != null) {
            this.position = [1, this.json.compulsory_exam.position];
            this.text_gruppo = "Obbligatorio";
            this.can_be_changed = false;
            this.is_compulsory = true;
        } else if (this.json.compulsory_group_id != null) {
            this.position = [2, this.json.compulsory_group.position];
            this.text_gruppo = this.json.compulsory_group.group.name; // obbligatorio nel gruppo
            this.can_be_changed = true;
            this.is_compulsory = true;
        } else if (!this.is_custom) {
            this.position = [3, this.json.id];
            this.text_gruppo = "A scelta libera";
            this.can_be_changed = true;
            this.is_compulsory = false;
        } else if (!this.is_empty) {
            this.position = [4, this.json.id];
            this.text_gruppo = "Personalizzato";
            this.can_be_changed = true;
            this.is_compulsory = false;
        } else {
            this.position = [5, this.json.id];
            this.text_group = "";
            this.can_be_changed = true;
            this.is_compulsory = false;
        }
    }

    populate_tr($tr, proposal) {
        var self = this;
        if (self.is_empty) return self.populate_tr_edit($tr, proposal);
        
        var $exam_name_td = $("<td></td>");
        
        // TODO:
        // bisogna gestire la presenza di esami "segnaposto" che corrispondono ad elementi del curriculum
        // non ancora scelti dall'utente.
        
        var $edit_button = null;
        var $trash_button = null;
        if (self.can_be_changed) {
            $edit_button = $("<button></button>").addClass("edit-button fas fa-edit").click(function() {
                self.populate_tr_edit($tr, proposal);
                $(".edit-button").prop("disabled", true);
                $(".add-button").prop("disabled", true);
            });
        }  
        if (!self.is_compulsory) {
            // due casi:
            // 1. esame a scelta libera non previsto dal curriculum
            // 2. esame personalizzato (mai previsto dal curriculum)
            $trash_button = $("<button></button>").addClass("fas fa-trash").click(function() {
                var lst = self.is_custom ? proposal.json.chosen_free_choice_exams : proposal.json.chosen_exams;
                var i = 0;
                for(;i<lst.length && lst[i].id != self.json.id;i++);
                if (i == lst.length) throw "runtime error: cannot find exam!";
                lst.splice(i, 1);
                proposal.update();
            });
        } else {
            // è un esame obbligatorio: non lo puoi cambiare
            $edit_button = $("<i></i>").addClass("fas fa-ban");
        }  
        $tr.empty();
        $tr.append($("<td></td>").addClass("edit").append($edit_button).append($trash_button));
        $tr.append($("<td></td>").text(self.code));
        $exam_name_td.text(self.name);
        if (self.tags.length>0) {
            $exam_name_td.append("<div class=proposal-tag></div>").text(self.tags.join(","));
        }
        $tr.append($exam_name_td);
        $tr.append($("<td></td>").text(self.sector));
        $tr.append($("<td></td>").text(self.credits));
        $tr.append($("<td></td>").text(self.text_gruppo));
    }

    populate_tr_edit($tr, proposal) {
        var self = this;
        
        
        // due casi:
        // 1. esame a scelta libera in un gruppo
        // 2. esame a scelta libera tra tutti gli esami in database
        var $button = $("<button></button>").addClass("done-button fas fa-check").click(function() {
            proposal.update();
        });
        
        var $exam_name_td = $("<td></td>");
        
        var promised_exams;
        if (self.json.compulsory_group_id != null) promised_exams = caps.get_group_exams(self.json.compulsory_group.group_id);
        else promised_exams = caps.get_exams();
        promised_exams.then(function(exams) {
            var $select = $("<select></select>");
            var id_exams = {};
            if (self.is_empty) {
                $select.append($("<option></option>").attr("value", "").text("-- seleziona l'esame --"));
            }
            exams.forEach(function(exam) {
                var $option = $option_for_exam(exam);
                if (exam.id == self.json.exam_id) $option.attr("selected","selected");
                $select.append($option);
                id_exams[exam.id] = exam;
            });
            if (!self.is_compulsory) {
                $select.append($("<option></option>").attr("value", "_").text("-- inserisci esame non in elenco --"))
            }
            $exam_name_td.empty().append($select);
            $select.change(function() {
                var val = $select.val();
                if (val == "_") {
                    var $credits = $("<input>").attr("value",self.json.credits).attr("type", "number").attr("min",1).attr("size",3)
                    .attr("required","required").attr("placeholder", "crediti").change(function(){
                        self.json.credits = parseInt($credits.val());
                        if (self.json.name != null) proposal.update();
                    });
                    var $name = $("<input>").attr("value",self.json.name).attr("type", "text").attr("required","required")
                    .attr("placeholder", "nome dell'esame").change(function() {
                        self.json.exam_id = null;
                        self.json.exam = null;
                        self.json.name = $name.val();
                        if (self.json.credits != null) proposal.update();
                    });
                    self.json.credits = null;
                    self.json.name = null;
                    $exam_name_td.empty().append($name).append($credits);
                } else if (val == "") {
                    proposal.update();
                } else {
                    self.json.exam_id = parseInt($select.val());
                    self.json.exam = id_exams[self.json.exam_id];
                    proposal.update();
                }
            });
        });

        $tr.empty();
        $tr.append($("<td></td>").addClass("edit").append($button));
        $tr.append($("<td></td>")); // code
        $tr.append($exam_name_td);  // name
        $tr.append($("<td></td>")); // sector
        $tr.append($("<td></td>")); // credits
        $tr.append($("<td></td>").text(self.text_gruppo));
    }

};

class Proposal {
    constructor(proposal_json, $div) {
        this.json = proposal_json;
        this.$div = $div;
        this.update();
    }
    
    update() {
        var self = this;
        this.year_exams = []; // year -> Exam
        this.year_credits = [];
        this.credits = 0;

        this.years = this.json.curriculum.degree.years;
    
        for (var year=1; year <= this.years; year++) {
            this.year_exams[year] = [];
            this.year_credits[year] = 0;
        };
    
        this.json.chosen_exams.concat(this.json.chosen_free_choice_exams).forEach(function(exam_json) {
            var exam = new Exam(exam_json);
            self.year_exams[exam.chosen_year].push(exam);
            self.year_credits[exam.chosen_year] += exam.credits;
            self.credits += exam.credits;
        });

        this.year_exams.forEach(function(exams) {
            exams.sort(function (a,b) {return compare_arrays(a.position,b.position)});
        });

        this.populate_html();
    }

    populate_html() {
        var curriculum = this.json.curriculum;
        var academic_year = parseInt(curriculum.academic_year);
        this.$div.empty();
        this.$div.append($("<h3></h3>").text(
            curriculum.degree.name + " — Curriculum "  
            + curriculum.name + " (anno di immatricolazione "
            + academic_year + "/" + (academic_year+1) + ")"));
        
        var self = this;
        this.year_exams.forEach(function(exams, year) {
            self.$div.append($("<h3></h3>").text([null, "Primo", "Secondo", "Terzo", "Quarto", "Quinto"][year] + " anno"));
            var $table = $("<table></table>");
            $table.append("<tr><th class=edit></th><th>Codice</th><th>Nome</th><th>Settore</th><th>Crediti</th><th>Gruppo</th>");
            exams.forEach(function(exam) {
                var $tr = $("<tr></tr>");
                exam.populate_tr($tr, self);
                $table.append($tr);
            });
            var $year_credits = $("<strong></strong>").text(self.year_credits[year]);

            var $exam_name_td = $("<td></td>");

            var $button = $("<button></button>").addClass("add-button fa fa-plus-square").click(function() {
                self.json.chosen_exams.push({
                    id: caps.get_new_id(),
                    chosen_year: year,
                    compulsory_exam: null,
                    compulsory_exam_id: null,
                    compulsory_group: null,
                    compulsory_group_id: null,
                    free_choice_exam: null,
                    free_choice_exam_id: null,
                    credits: null,
                    exam: null,
                    exam_id: null,
                    name: null
                });
                self.update();
            });


            $table.append($("<tr></tr>")
                .append($("<td></td>").addClass("edit").append($button))
                .append($("<td></td>"))
                .append($exam_name_td)
                .append($("<td></td>"))
                .append($("<td></td>").append($year_credits))
                .append("<td></td>"));
            self.$div.append($table);
        });   
    }
};

function start() {
    caps = new Caps(caps_json);
    var proposal = new Proposal(proposal_json, $("#proposal_div"));
}

$(function() {
    // start();
});