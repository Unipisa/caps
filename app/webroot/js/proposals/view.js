// var proposal_json = ... defined in html file

class Exam {
    constructor(exam_json) {
        this.json = exam_json;
        this.id = this.json.id;
        var e = exam_json;
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
            this.text_edit = null;
        } else if (this.json.compulsory_group_id != null) {
            this.position = 2000 + this.json.compulsory_group.position;
            this.text_gruppo = this.json.compulsory_group.group.name;
            this.text_edit = "cambia";
        } else if (this.json.free_choice_exam_id != null) {
            this.position = 3000 + this.json.free_choice_exam.position;
            this.text_gruppo = "A scelta libera";
            this.text_edit = "cambia";
        } else {
            this.position = 4000;
            this.text_gruppo = "";
            this.text_edit = "elimina";
        }
    }

    populate_tr($tr) {
        $tr.attr("id", "tr_exam_" + this.id);
        $tr.append($("<td></td>").addClass("edit").html(this.text_edit ? "<a href='#' id=edit_exam_" + this.id + ">" + this.text_edit + "</a>":"obbligatorio"));
        $tr.append($("<td></td>").text(this.code));
        var $td = $("<td></td>").text(this.name);
        if (this.tags.length>0) {
            $td.append("<div class=proposal-tag></div>").text(this.tags.join(","));
        }
        $tr.append($td);
        $tr.append($("<td></td>").text(this.sector));
        $tr.append($("<td></td>").text(this.credits));
        $tr.append($("<td></td>").text(this.text_gruppo));
    }
};

class Proposal {
    constructor(proposal_json) {
        var self = this;
        this.json = proposal_json;
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
            self.year_credits[year] += exam.credits;
            self.credits += exam.credits;
            self.id_exams[exam.id] = exam;
        });

        this.year_exams.forEach(function(exams) {
            exams.sort(function (a,b) {return a.position - b.position});
        });
    }

    populate_html($div) {
        var curriculum = this.json.curriculum;
        var academic_year = parseInt(curriculum.academic_year);
        $div.append($("<h3></h3>").text(
            curriculum.degree.name + " — Curriculum "  
            + curriculum.name + " (anno di immatricolazione "
            + academic_year + "/" + (academic_year+1) + ")"));
        
        var self = this;
        this.year_exams.forEach(function(exams, year) {
            $div.append($("<h3></h3>").text([null, "Primo", "Secondo", "Terzo", "Quarto", "Quinto"][year] + " anno"));
            var $table = $("<table></table>");
            $table.append("<tr><th class=edit></th><th>Codice</th><th>Nome</th><th>Settore</th><th>Crediti</th><th>Gruppo</th>");
            exams.forEach(function(exam) {
                var $tr = $("<tr></tr>");
                exam.populate_tr($tr);
                $table.append($tr);
            });
            var $year_credits = $("<strong></strong>").text(self.year_credits[year]);
            $table.append($("<tr></tr>")
            .append("<td></td><td></td><td></td>")
            .append($("<td></td>").append($year_credits))
            .append("<td></td>"));
            $div.append($table);
        });   
    }
};

$(function() {
    //var proposal = new Proposal(proposal_json);
    //proposal.populate_html($("#proposal_div"));
});