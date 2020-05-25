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
}

class Exam {
    constructor(exam_json) {
        this.json = exam_json;
        this.update();
    }

    update() {
        this.id = this.json.id;
        var e = this.json;
        if (e.exam) e = e.exam;
        
        this.credits = e.credits;
        this.code = e.code;
        this.name = e.name;
        this.sector = e.sector;
        this.credits = e.credits;
        this.tags = e.tags ? e.tags : [];
        this.chosen_year = this.json.chosen_year;
           
        if (this.json.compulsory_exam_id != null) {
            this.position = 1000 + this.json.compulsory_exam.position;
            this.text_gruppo = "Obbligatorio";
        } else if (this.json.compulsory_group_id != null) {
            this.position = 2000 + this.json.compulsory_group.position;
            this.text_gruppo = this.json.compulsory_group.group.name;
        } else if (this.json.free_choice_exam_id != null) {
            this.position = 3000 + this.json.free_choice_exam.position;
            this.text_gruppo = "A scelta libera";
        } else {
            this.position = 4000;
            this.text_gruppo = "Personalizzato";
        }
    }

    populate_tr($tr, proposal) {
        var self = this;
        $tr.empty();
        $tr.attr("id", "tr_exam_" + self.id);

        var $button = null;
        if (self.json.compulsory_exam_id != null) {
            $button = $("<i></i>").addClass("fas fa-ban");
        } else if (self.json.compulsory_group_id != null || self.json.free_choice_exam_id != null) {
            $button = $("<button></button>").click(function() {
                var promised_exams;
                if (self.json.compulsory_group_id != null) promised_exams = caps.get_group_exams(self.json.compulsory_group.group_id);
                else promised_exams = caps.get_exams();
                promised_exams.then(function(exams) {
                    var $select = $("<select></select>");
                    var id_exams = {};
                    exams.forEach(function(exam) {
                        var $option = $("<option></option>").attr("value", exam.id).text(exam.code + " — " + exam.name + " " + exam.sector + " — " + exam.credits + " CFU");
                        if (exam.id == self.json.exam_id) $option.attr("selected","selected");
                        $select.append($option);
                        id_exams[exam.id] = exam;
                    });
                    $("#exam_name_td_" + self.id).empty().append($select);
                    $select.change(function() {
                        self.json.exam_id = parseInt($select.val());
                        self.json.exam = id_exams[self.json.exam_id];
                        proposal.update();
                    });
                });    
            });
            $button.addClass("fas fa-edit");
        } else if (self.json.free_choice_exam_id != null) {
            $button = $("<button></button>").click(function() {

            });
        }
        $tr.append($("<td></td>").addClass("edit").append($button));
        $tr.append($("<td></td>").text(self.code));
        var $td = $("<td></td>").attr("id", "exam_name_td_"+self.id).text(self.name);
        if (self.tags.length>0) {
            $td.append("<div class=proposal-tag></div>").text(self.tags.join(","));
        }
        $tr.append($td);
        $tr.append($("<td></td>").text(self.sector));
        $tr.append($("<td></td>").text(self.credits));
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
        this.id_exams = {}; // id -> Exam
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
            self.id_exams[exam.id] = exam;
        });

        this.year_exams.forEach(function(exams) {
            exams.sort(function (a,b) {return a.position - b.position});
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
            $table.append($("<tr></tr>")
            .append("<td class=edit><td></td><td></td><td></td>")
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