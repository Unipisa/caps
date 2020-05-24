// var proposal = ... defined in html file

function position(exam) {
    var r = 0;
    if (exam.compulsory_exam_id != null) return 1000 + exam.compulsory_exam.position;
    else if (exam.compulsory_group_id != null) return 2000 + exam.compulsory_group.position;
    else if (exam.free_choice_exam_id != null) return 3000 + exam.free_choice_exam.position;
    return 4000;
}

function populate_html() {
    var $div = $("#proposal_div");
    var curriculum = proposal.curriculum;
    var academic_year = parseInt(curriculum.academic_year);
    $div.append($("<h3></h3>").text(
        curriculum.degree.name + " — Curriculum "  
        + curriculum.name + " (anno di immatricolazione "
        + academic_year + "/" + (academic_year+1) + ")"));
    var years = curriculum.degree.years;

    var year_exams = [];
    for (year=1; year<=years; year++) year_exams[year] = [];

    proposal.chosen_exams.forEach(function(exam) {
        year_exams[exam.chosen_year].push(exam);
    });

    proposal.chosen_free_choice_exams.forEach(function(exam) {
        year_exams[exam.chosen_year].push(exam);
    });

    year_exams.forEach(function(exams, year) {
        exams.sort(function (a,b) {return position(a) - position(b)});
        $div.append($("<h3></h3>").text([null, "Primo", "Secondo", "Terzo", "Quarto", "Quinto"][year] + " anno"));
        var year_credits = 0;
        $table = $("<table></table>");
        $table.append("<tr><th>Codice</th><th>Nome</th><th>Settore</th><th>Crediti</th><th>Gruppo</th>");
        exams.forEach(function(exam) {
            var e = exam;
            if (e.exam) e = e.exam;
            year_credits += e.credits;
            var $tr = $("<tr></tr>");
            $tr.append($("<td></td>").text(e.code));
            var $td = $("<td></td>").text(e.name);
            if (e.tags && e.tags.length>0) {
                $td.append("<div class=proposal-tag></div>").text(e.tags.join(","));
            }
            $tr.append($td);
            $tr.append($("<td></td>").text(e.sector));
            $tr.append($("<td></td>").text(e.credits));
            if (exam.compulsory_exam_id != null) $tr.append($("<td></td>").text("Obbligatorio"));
            else if (exam.compulsory_group_id != null) $tr.append($("<td></td>").text(exam.compulsory_group.group.name));
            else if (exam.free_choice_exam_id != null) $tr.append($("<td></td>").text("A scelta libera"));
            else $tr.append($("<td></td>"));
            $table.append($tr);
        });
        var $year_credits = $("<strong></strong>").text(year_credits);
        $table.append($("<tr></tr>")
            .append("<td></td><td></td><td></td>")
            .append($("<td></td>").append($year_credits))
            .append("<td></td>"));
        $div.append($table);
    });

}

$(function() {
});