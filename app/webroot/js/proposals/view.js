
// example variables defined in html file:

var proposal_json_example = {
    "id":9,"user_id":2,"modified":"2020-05-24T06:10:30+00:00","curriculum_id":9,"state":"draft","submitted_date":null,"approved_date":null,"auths":[],"attachments":null,
    "curriculum":{
        "id":9,"name":"Curriculum completo","academic_year":2021,"degree_id":3,"notes":"mettiamoci tutto!",
        "degree":{
            "id":3,"name":"Laurea Triennale","years":3
        }
    },
    "chosen_free_choice_exams":[
        {"id":15,"name":"paraffinologia 2 & 3","credits":10,"proposal_id":9,"free_choice_exam_id":null,"chosen_year":1,"free_choice_exam":null},
        {"id":16,"name":"boh! boh! boh!","credits":51,"proposal_id":9,"free_choice_exam_id":null,"chosen_year":2,"free_choice_exam":null},
        {"id":17,"name":"un credito!","credits":1,"proposal_id":9,"free_choice_exam_id":null,"chosen_year":3,"free_choice_exam":null}
    ],
    "chosen_exams":[
        {"id":63,"credits":9,"exam_id":33,"proposal_id":9,"compulsory_group_id":null,"compulsory_exam_id":20,"chosen_year":1,"free_choice_exam_id":null,"free_choice_exam":null,"compulsory_group":null,
        "compulsory_exam":{"id":20,"year":1,"position":0,"exam_id":33,"curriculum_id":9},
        "exam":{"id":33,"name":"Astrofisica","code":"194BB","sector":"FIS\/05","credits":9,"tags":[]}},
        {"id":64,"credits":40,"exam_id":1,"proposal_id":9,"compulsory_group_id":10,"compulsory_exam_id":null,"chosen_year":1,"free_choice_exam_id":null,"free_choice_exam":null,
        "compulsory_group":{"id":10,"year":1,"position":0,"group_id":1,"curriculum_id":9,
        "group":{"id":1,"name":"gruppo bello"}},"compulsory_exam":null,
        "exam":{"id":1,"name":"Esame bello","code":"12345","sector":"MAT99","credits":40,"tags":[]}},
        {"id":65,"credits":9,"exam_id":61,"proposal_id":9,"compulsory_group_id":null,"compulsory_exam_id":null,"chosen_year":1,"free_choice_exam_id":9,
        "free_choice_exam":{"id":9,"year":1,"position":0,"curriculum_id":9},"compulsory_group":null,"compulsory_exam":null,
        "exam":{"id":61,"name":"Fisica medica","code":"205BB","sector":"FIS\/07","credits":9,"tags":[]}},
        {"id":66,"credits":3,"exam_id":74,"proposal_id":9,"compulsory_group_id":null,"compulsory_exam_id":null,"chosen_year":1,"free_choice_exam_id":null,"free_choice_exam":null,"compulsory_group":null,"compulsory_exam":null,
        "exam":{"id":74,"name":"Laser a Stato Solido","code":"190BB","sector":"FIS\/03","credits":3,"tags":[]}},
        {"id":67,"credits":9,"exam_id":36,"proposal_id":9,"compulsory_group_id":null,"compulsory_exam_id":21,"chosen_year":2,"free_choice_exam_id":null,"free_choice_exam":null,"compulsory_group":null,"compulsory_exam":{"id":21,"year":2,"position":0,"exam_id":36,"curriculum_id":9},
        "exam":{"id":36,"name":"Biofisica","code":"196BB","sector":"FIS\/03","credits":9,"tags":[]}},
        {"id":68,"credits":50,"exam_id":2,"proposal_id":9,"compulsory_group_id":11,"compulsory_exam_id":null,"chosen_year":3,"free_choice_exam_id":null,"free_choice_exam":null,
        "compulsory_group":{"id":11,"year":3,"position":0,"group_id":1,"curriculum_id":9,"group":{"id":1,"name":"gruppo bello"}},"compulsory_exam":null,
        "exam":{"id":2,"name":"Esame pi\u00f9 bello","code":"2345","sector":"Mat98","credits":50,"tags":[]}},
        {"id":69,"credits":9,"exam_id":63,"proposal_id":9,"compulsory_group_id":null,"compulsory_exam_id":null,"chosen_year":3,"free_choice_exam_id":null,"free_choice_exam":null,"compulsory_group":null,"compulsory_exam":null,
        "exam":{"id":63,"name":"Fisica stellare","code":"211BB","sector":"FIS\/05","credits":9,"tags":[]}}
    ],
    "user":{"id":2,"username":"my-fake-user","name":"Utente Finto","number":"000000","givenname":"Utente","surname":"Finto","email":"unknown@nodomain.no","admin":false}
    };
    
var caps_json_example = {
    curriculumURL: "\/curricula\/view",
    examsURL: "\/exams.json",
    groupsURL: "\/groups.json",
    curriculaURL: "\/curricula.json",
    cds: ""    };
/**/

var CREDITS_PER_YEAR = 60;

var caps;

class Caps {
    constructor(json) {
        this.json = json;
        this.exams = null; // Promise of Array of all exams
        this.id_group = null; // Promise of Map group_id -> exams
        this.MAX_ID = 2000000000; // ids greater than this are used for new objects
        this.new_id_count = this.MAX_ID;
        this.curricula = null; // Promise of Array of all curricula
        this.years = null; // valid when this.curricula is resolved
        this.year_curricula = null; // valid when this.curricula is resolved
    }

    get_exams() {
        // @return a Promise of an Array of all exams
        if (this.exams === null) {
            this.exams = $.get(this.json.examsURL).then(function(response) {
                return response["exams"];
            });
        }
        return this.exams;
    }

    get_group_exams(group_id) {
        // @return a Promise of the Array of exams in the group `group_id`
        if (this.id_group === null) {
            this.id_group = $.get(this.json.groupsURL).then(function(response) {
                let map = new Map();             
                response["groups"].forEach(function (group) {
                    map.set(group.id, group.exams);                
                });
                return map;
            });
        };

        return this.id_group.then(function(map) {
            return map.get(group_id);
        });
    }

    get_new_id() {
        this.new_id_count++;
        return this.new_id_count;
    }

    get_curriculum(id) {
        // mi sa che questo riporta più informazioni
        // di get_curricula
        return $.get(this.json.curriculumURL + "/" + id + ".json");
    }

    get_curricula() {
        if (this.curricula === null) {
            var self = this;
            this.curricula = $.get(this.json.curriculaURL).then(function(response) {
                var curricula = response['curricula'];
                self.years = [];
                self.year_curricula = new Map();
                curricula.forEach(function(curriculum) {
                    var year = curriculum.academic_year
                    if (!self.years.includes(year)) {
                        self.years.push(year);
                        self.year_curricula.set(year,[]);
                    }
                    self.year_curricula.get(year).push(curriculum);                
                });
                self.years.sort();
                return curricula;
            });
        }
        return this.curricula;
    }

    get_years() {
        var self = this;
        return self.get_curricula().then(function() {return self.years});
    }

    get_curricula_in_year(year) {
        var self = this;
        return self.get_curricula().then(function() {
            return self.year_curricula.get(year)
        });
    }
};

function $option_for_exam(exam) {
    return $("<option></option>").attr("value", exam.id).text(exam.code + " — " + exam.name + " " + exam.sector + " — " + exam.credits + " CFU");
}

function $option_for_curriculum(curriculum) {
    return $("<option></option>").attr("value", curriculum.id)
        .text(curriculum['degree']['name'] + " — Curriculum " + curriculum['name']);
}

function compare_arrays(a, b) {
    for (var i = 0; i < a.length && i < b.length; ++i) {
        if (a[i] == b[i]) continue;
        if (a[i] < b[i]) return -1;
        else return 1;
    }
    return a.length - b.length;
}

function get_ordinal(n) {
    return ["primo", "secondo", "terzo", "quarto", "quinto", "sesto", "settimo", "ottavo", "nono", "decimo"][n-1] || (n + "-esimo"); 
}

function assert(condition, message) {
    console.assert(condition, message);
}

class Exam {
    constructor(proposal, exam_json) {
        // exam_json può rappresentare un ChosenExam oppure un ChosenFreeChoiceExam
        this.json = exam_json;
        this.duplicated = false;
        this.id = caps.get_new_id();



        this.is_custom = false;
        this.is_empty = false;
        this.is_compulsory = false;
        this.can_be_changed = false;
        this.credits = this.json.credits;
        this.expected_credits = null;
        this.chosen_year = this.json.chosen_year;
        this.expected_year = null;
        this.tags = [];
           
        if (this.json.compulsory_exam_id != null) {
            // esame obbligatorio senza scelta
            assert(this.json.exam);
            assert(this.json.compulsory_exam.id === this.json.compulsory_exam_id);
            assert(this.json.compulsory_exam.exam_id === this.json.exam_id);
            assert(this.json.compulsory_group_id === null);
            assert(this.json.compulsory_group === null);
            assert(this.json.exam_id === this.json.exam.id);
            assert(!this.json.name);
            this.code = this.json.exam.code;
            this.sector = this.json.exam.sector;
            this.name = this.json.exam.name;
            this.tags = this.json.exam.tags || []; // warning: i gli esami caricati non hanno i tags
            if (this.json.exam.credits != this.credits) this.expected_credits = this.json.exam.credits;
            if (this.json.compulsory_exam.year != this.chosen_year) this.expected_year = this.json.compulsory_exam.year;
            this.position = [1, this.json.compulsory_exam.position];
            this.text_gruppo = "Obbligatorio";
            this.is_compulsory = true;
            assert(this.json.exam_id); 
        } else if (this.json.compulsory_group_id != null) {
            // esame obbligatorio con scelta in un gruppo
            assert(this.json.compulsory_exam_id === null);
            assert(this.json.compulsory_exam === null);
            assert(this.json.compulsory_group.id === this.json.compulsory_group_id);
            assert(!this.json.name);
            if (this.json.exam) {
                assert(this.json.exam_id === this.json.exam.id);
                this.code = this.json.exam.code;
                this.sector = this.json.exam.sector;
                this.name = this.json.exam.name;
                this.tags = this.json.exam.tags || []; // warning: gli esami caricati non hanno i tags
                assert(this.tags.length >= 0); // è un array
                if (this.json.exam.credits != this.credits) this.expected_credits = this.json.exam.credits;
            } else {
                // l'esame non è stato ancora scelto
                this.is_empty = true;
            }
            if (this.json.compulsory_group.year != this.chosen_year) this.expected_year = this.json.compulsory_group.year;
            this.position = [2, this.json.compulsory_group.position];
            this.text_gruppo = this.json.compulsory_group.group.name;
            this.can_be_changed = true;
            this.is_compulsory = true;
        } else if (this.json.exam_id) {
            // esame a scelta libera scelto tra quelli del corso
            assert(this.json.compulsory_exam === null);
            assert(this.json.compulsory_group === null);
            console.assert(!this.json.name);
            this.code = this.json.exam.code;
            this.sector = this.json.exam.sector;
            this.name = this.json.exam.name;
            this.tags = this.json.exam.tags || []; // warning: gli esami caricati non hanno i tags
            assert(this.tags.length >= 0); // è un array
            if (this.json.exam.credits != this.credits) this.expected_credits = this.json.exam.credits;
            this.position = [3, this.json.id];
            this.text_gruppo = "Esame a scelta";
            this.can_be_changed = true;
        } else if (this.json.name) {
            // esame a scelta libera personalizzato
            assert(this.json.compulsory_exam === undefined);
            assert(this.json.compulsory_group === undefined);
            assert(this.json.exam === undefined);
            this.code = null;
            this.sector = null;
            this.name = this.json.name;
            this.position = [4, this.json.id];
            this.text_gruppo = "Esame personalizzato";
            this.can_be_changed = true;
            this.is_custom = true;
        } else {
            // esame a scelta libera non ancora scelto
            this.code = null;
            this.sector = null;
            this.name = null;
            this.position = [4, this.json.id];
            this.text_gruppo = "Esame a scelta";
            this.can_be_changed = true;
            this.is_empty = true;
        }

        if (this.json._auto) this.text_group += " auto"; // debugging
        if (this.expected_year) {
            proposal.add_warning("nel curriculum selezionato l'esame \"" + this.name + "\" è previsto al " + get_ordinal(this.expected_year) + " anno");
        }

    }
    
    is_same_as(other_exam) {
        if (this.code == null && other_exam.code == null) return this.name == other_exam.name; 
        return this.code == other_exam.code;
    }
    
    populate_tr($tr, proposal) {
        var self = this;
        if (this.duplicated || this.is_empty || this.expected_year || this.expected_credits) {
            $tr.css('background-color', 'yellow');
        }
        if (self.is_empty && proposal.edit_mode) return self.populate_tr_edit($tr, proposal);
        
        var $exam_name_td = $("<td></td>");
        if (proposal.edit_mode) {
                
            var $edit_button = null;
            var $trash_button = null;
            if (self.can_be_changed) {
                $edit_button = $("<button></button>").addClass("edit-button fas fa-edit").click(function() {
                    self.populate_tr_edit($tr, proposal);
                    $(".edit-button").prop("disabled", true);
                    $(".add-button").prop("disabled", true);
                    $(".trash-button").prop("disabled", true);
                });
            } else {
                $edit_button = $("<i></i>").addClass("fas fa-ban");
            }
            if (self.duplicated || !self.is_compulsory) {
                $trash_button = $("<button></button>").addClass("trash-button fas fa-trash").click(function() {
                    var lst = self.is_custom ? proposal.json.chosen_free_choice_exams : proposal.json.chosen_exams;
                    var i = 0;
                    for(;i<lst.length && lst[i].id != self.json.id;i++);
                    if (i == lst.length) throw "runtime error: cannot find exam!";
                    lst.splice(i, 1);
                    proposal.update();
                });
            }
            $tr.empty();
            $tr.append($("<td></td>").addClass("edit").append($edit_button).append($trash_button));
        } else {
            $tr.empty();
        }
        $tr.append($("<td></td>").text(self.code));
        $exam_name_td.text(self.name);
        if (self.tags.length>0) {
            $exam_name_td.append("<div class=proposal-tag></div>").text(self.tags.join(","));
        }
        $tr.append($exam_name_td);
        $tr.append($("<td></td>").text(self.sector));
        $tr.append($("<td></td>").text(self.expected_credits?self.credits + " / " + self.expected_credits:self.credits));
        $tr.append($("<td></td>").text(self.text_gruppo));
    }

    populate_tr_edit($tr, proposal) {
        var self = this;
        
        
        // due casi:
        // 1. esame a scelta libera in un gruppo
        // 2. esame a scelta libera tra tutti gli esami in database (custom)
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
                    self.json.exam_id = parseInt(val);
                    self.json.exam = id_exams[self.json.exam_id];
                    self.json.credits = self.json.exam.credits; // in teoria l'utente potrebbe selezionare un numero diverso di crediti
                    if (self.json._auto) {
                        delete self.json._auto;
                    }
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
        this.edit_mode = false;
        this.update();
    }
    
    update_base() { // syncronous part
        var self = this;
        self.year_exams = []; // year -> Exam
        self.year_credits = [];
        self.credits = 0;
        self.warnings = [];

        self.years = self.json.curriculum.degree.years;
        self.expected_credits = 0;
    
        for (var year=1; year <= self.years; year++) {
            self.year_exams[year] = [];
            self.year_credits[year] = 0;
            self.expected_credits += CREDITS_PER_YEAR;
        };

        var lst = []

        self.json.chosen_exams.concat(self.json.chosen_free_choice_exams).forEach(function(exam_json) {
            var exam = new Exam(self, exam_json);
            self.year_exams[exam.chosen_year].push(exam);
            self.year_credits[exam.chosen_year] += exam.credits;
            self.credits += exam.credits;
            if (exam.is_empty) {
                self.add_warning("Alcuni esami non sono stati scelti");
            } else {
                // controlla se è duplicato
                lst.forEach(function(previous_exam) {
                    if (exam.is_same_as(previous_exam)) {
                        exam.duplicated = true;
                        previous_exam.duplicated = true;
                        self.add_warning("Attenzione: l'esame \"" + exam.name + "\" è duplicato");
                    }
                });
            }
            lst.push(exam);
        });

        if (self.credits < self.expected_credits) {
            self.add_warning("Hai inserito solo " + self.credits + " crediti su " + self.expected_credits + " attesi");
        }

        self.year_exams.forEach(function(exams) {
            exams.sort(function (a,b) {return compare_arrays(a.position,b.position)});
        });
    }

    update() {
        var self = this;
        return self.fix_curriculum().then(function() {self.update_base()}).then(function() {self.populate_html()});
    }

    add_warning(message) {
        if (!this.warnings.includes(message)) this.warnings.push(message);
    }

    fix_curriculum() {
        var curriculum_example = {
            "id": 9, "name": "Curriculum completo", "academic_year": 2021, "degree_id": 3, "notes": "mettiamoci tutto!",
            "degree": {"id": 3,"name": "Laurea Triennale", "years": 3},
            "compulsory_exams": [
                { "id": 20, "year": 1, "position": 0, "exam_id": 33, "curriculum_id": 9, 
                   "exam": {"id": 33,"name": "Astrofisica","code": "194BB", "sector": "FIS\/05", "credits": 9}
                },
                { "id": 21,"year": 2,"position": 0,"exam_id": 36,"curriculum_id": 9,
                    "exam": {"id": 36,"name": "Biofisica","code": "196BB", "sector": "FIS\/03", "credits": 9}
                }
            ],
            "compulsory_groups": [{
                    "id": 10, "year": 1, "position": 0,"group_id": 1, "curriculum_id": 9,
                    "group": {"id": 1,"name": "gruppo bello"}},
                {    "id": 11,"year": 3,"position": 0,"group_id": 1, "curriculum_id": 9,
                    "group": {"id": 1,"name": "gruppo bello"}}
            ],
            "free_choice_exams": [
                {
                    "id": 9,"year": 1,"position": 0, "curriculum_id": 9
                }
            ]
        };
        var self = this;
        if (!self.edit_mode) return Promise.resolve(); // non adattare il curriculum se non lo stiamo modificando
        return caps.get_curriculum(self.json.curriculum.id).then(function(curriculum) {    
            // rimuovi eventuali esami che erano stati aggiunti automaticamente per soddisfare
            // il vecchio curriculum
            self.json.chosen_exams = self.json.chosen_exams.filter(function(chosen_exam){
                return chosen_exam._auto !== true; 
            });
    
            // fa una copia dell'array degli esami scelti
            // cosi si può togliere gli esami man mano che vengono 
            // associati a scelte obbligatorie (esami obbligatori o obbligo nel gruppo)
            // le scelte "libere" non vengono associate, tanto sono inutili (si potranno togliere)
            var chosen_exams = self.json.chosen_exams.slice(0);
            // fa una copia dei requisiti del curriculum cosi' posso rimuovere quelli
            // gia' soddisfatti
            var compulsory_exams = curriculum.compulsory_exams.slice(0);
            var compulsory_groups = curriculum.compulsory_groups.slice(0);
            // se un requisito soddisfa il curriculum lo tengo
            // altrimenti lo tolgo (evidentemente e' cambiato il curriculum)
            chosen_exams.forEach(function(chosen, i){
                if (chosen.compulsory_exam && chosen.compulsory_exam.curriculum_id === curriculum.id) {
                    compulsory_exams = compulsory_exams.filter(function(compulsory_exam){return compulsory_exam.id != chosen.compulsory_exam_id});
                } else {
                    chosen.compulsory_exam_id = null;
                    chosen.compulsory_exam = null
                }
                if (chosen.compulsory_group && chosen.compulsory_group.curriculum_id === curriculum.id) {
                    compulsory_groups = compulsory_groups.filter(function(compulsory_group){return compulsory_group.id != chosen.compulsory_group_id});
                } else {
                    chosen.compulsory_group_id = null;
                    chosen.compulsory_group = null
                }
            });
            // cerca di soddisfare i requisiti del curriculum
            compulsory_exams.forEach(function(compulsory_exam){
                var i = chosen_exams.findIndex(function(chosen_exam) {return chosen_exam.exam_id == compulsory_exam.exam_id});
                if (i >= 0) {
                    var chosen = chosen_exams[i];
                    if (chosen.exam_id == compulsory_exam.exam_id) {
                        chosen.compulsory_exam_id = compulsory_exam.id;
                        chosen.compulsory_exam = compulsory_exam;
                        chosen_exams.splice(i,1);
                    }
                } else { 
                    // esame obbligatorio non soddisfatto: bisogna aggiungere l'esame
                    self.json.chosen_exams.push(
                        {
                            _auto: true, // this chosen exam has been created automatically: remove if curriculum is changed
                            id: caps.get_new_id(),
                            credits: compulsory_exam.exam.credits,
                            chosen_year: compulsory_exam.year,
                            exam_id: compulsory_exam.exam.id,
                            exam: compulsory_exam.exam,
                            proposal_id: self.json.id,
                            compulsory_exam_id: compulsory_exam.id,
                            compulsory_exam: compulsory_exam,
                            compulsory_group_id: null,
                            compulsory_group: null,
                            free_choice_exam: null,
                            free_choice_exam_id: null
                        }
                    );
                }
            });
            // bisogna caricare tutti i gruppi menzionati nel curriculum
            return Promise.all(compulsory_groups.map(function(compulsory_group) {
                return caps.get_group_exams(compulsory_group.group_id).then(function(exams) {
                    return [compulsory_group, exams]
                });
            })).then(function(group_couples) {
                group_couples.forEach(function(couple) {
                    var compulsory_group = couple[0];
                    var group_exams = couple[1];
                    var i = chosen_exams.findIndex(function(chosen) {
                        return group_exams.findIndex(function(group_exam) {
                            return group_exam.id == chosen.exam_id
                        }) >= 0;                        
                    });
                    if (i >= 0) {
                        var chosen = chosen_exams[i];
                        chosen.compulsory_group_id = compulsory_group.id;
                        chosen.compulsory_group = compulsory_group;
                        chosen_exams.splice(i,1);
                    } else {
                        // esame nel gruppo non soddisfatto: aggiungi segnaposto per forzare la scelta
                        self.json.chosen_exams.push({
                            _auto: true,
                            id: caps.get_new_id(),
                            credits: null,
                            chosen_year: compulsory_group.year,
                            exam_id: null,
                            exam: null,
                            proposal_id: self.json.id,
                            compulsory_exam_id: null,
                            compulsory_exam: null,
                            compulsory_group_id: compulsory_group.id,
                            compulsory_group: compulsory_group,
                            free_choice_exam: null,
                            free_choice_exam_id: null
                        });
                    }
                });
            });    
        });
    }

    populate_html() {
        var self = this;
        var curriculum = this.json.curriculum;
        var academic_year = parseInt(curriculum.academic_year);
        this.$div.empty();
        var $curriculum_change_div = $("<div></div>").hide();
        this.$div.append($curriculum_change_div);
        var $h3 = $("<h3></h3>").text(
            curriculum.degree.name + " — Curriculum "  
            + curriculum.name + " (anno di immatricolazione "
            + academic_year + "/" + (academic_year+1) + ") ");
        this.$div.append($h3);
        if (this.edit_mode) {
            var $change = $("<button></button>").addClass("fas fa-edit").text("cambia curriculum").click(function() {
                var $select_year = $("<select></select>");
                var $select_curriculum = $("<select></select>").hide();
                $curriculum_change_div.empty().append($select_year).append($select_curriculum);
                caps.get_years().then(function(years) {
                    $select_year.append($("<option></option>").attr("value","").text("-- selezione l'anno di immatricolazione --"));
                    years.forEach(function(year) {
                        $select_year.append($("<option></option>").attr("value", year).text(year + " / " + (year+1)));
                    });
                    $h3.hide(); // si potrebbe implementare il tasto ESC per annullare il cambio di curriculum
                    $curriculum_change_div.show();
                    $select_year.change(function() {
                        var $year = $select_year.val();
                        if ($year === "") return;
                        $year = parseInt($year);
                        caps.get_curricula_in_year($year).then(function(curricula) {
                            $select_curriculum.append($("<option></option>").attr("value", "").text("-- selezion il curriculum --"));
                            var id_curriculum = new Map;
                            curricula.forEach(function(curriculum){
                                $select_curriculum.append($option_for_curriculum(curriculum));
                                id_curriculum.set(curriculum.id, curriculum);
                            })
                            $select_curriculum.show().click(function(){
                                var id = $select_curriculum.val();
                                if (id === "") return;
                                caps.get_curriculum(id).then(function(curriculum) {
                                    self.json.curriculum = curriculum;
                                    self.json.curriculum_id = curriculum.id;
                                    self.update();
                                })
                            });
                        })
                    })
                });
            });
            $h3.append($change);            
        } else {
            $h3.append($("<button></button>").addClass("fas fa-edit").text("modifica").click(function() {
                    self.edit_mode = true;
                    self.populate_html();
                }));
        }
        var $debug = $("<p></p>").text("loading....");
        this.$div.append($debug);
        caps.get_curriculum(curriculum.id).then(function(curriculum) {
            var text = "curriculum " + curriculum.name + "<br />";
            text += "compulsory_exams: " + curriculum.compulsory_exams.map(function(compulsory_exam) {
                return compulsory_exam.exam.name + " (" + compulsory_exam.year + " anno)";
            }).join(", ") + "<br />";
            text += "compulsory_groups: " + curriculum.compulsory_groups.map(function(compulsory_group) {
                return compulsory_group.group.name
            }).join(", ") + "<br />";
            text += "free_choice: " + curriculum.free_choice_exams.length;
            $debug.html(text);
        });
        this.year_exams.forEach(function(exams, year) {
            self.$div.append($("<h3></h3>").text(get_ordinal(year) + " anno"));
            var $table = $("<table></table>");
            $table.append("<tr>"); 
            if (self.edit_mode) $table.append("<th></th>")
            $table.append("<th>Codice</th><th>Nome</th><th>Settore</th><th>Crediti</th><th>Gruppo</th>");
            exams.forEach(function(exam) {
                var $tr = $("<tr></tr>");
                exam.populate_tr($tr, self);
                $table.append($tr);
            });
            var $tr = $("<tr></tr>")
            if (self.edit_mode) {
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
                $tr.append($("<td></td>").append($button));
            }
            $tr.append("<td></td><td></td><td></td><td><b>" + self.year_credits[year] + "</b> / " + CREDITS_PER_YEAR + "</td><td></td>");
            $table.append($tr);
            self.$div.append($table);
        });   
        self.warnings.forEach(function(message){
            self.$div.append($("<p></p>").css("background-color","yellow").text(message));
        })
    }
};

function start() {
    caps = new Caps(caps_json);
    var proposal = new Proposal(proposal_json, $("#proposal_div"));
}

$(function() {
    // start();
});