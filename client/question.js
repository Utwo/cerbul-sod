// reset everything at 0

var corect = 0, gresit = 0, graph = [{gresit: 0, corect: 0}];
Session.setDefault("counter", 0);

Template.score.helpers({
    score: function () {
        return {counter: Session.get('counter'), corect: corect, gresit: gresit};
    }
});

Template.question.helpers({
    questions: function () {
        $("input[name='answer']").val('');
        return Session.get('question');
    }
});

Template.question.rendered = function () {
    if (!this.rendered) {
        Meteor.call('questionRandom', function (error, response) {
            Session.set('question', response)
        });
        questions = Session.get('question');
        this.rendered = true;
    }
};

var drawChart = function () {
    // Our labels and three data series
    var i = 1, series = [[], []], labels = [];
    for (var key in graph) {
        series[0].push(graph[key].corect);
        series[1].push(graph[key].gresit);
        labels.push(i++);
    }

    // All you need to do is pass your configuration as third parameter to the chart function
    new Chartist.Line('.ct-chart:last-of-type',
        {series: series, labels: labels},
        {
            low: 0,
            showArea: true,
            // X-Axis specific configuration
            axisX: {
                showGrid: false
            },
            // Y-Axis specific configuration
            axisY: {
                // Lets offset the chart a bit from the labels
                offset: 40
            }
        }
    );
}

var result = function(){
    $('ol:last').after("<div class='ct-chart'></div><p class='finish'>### Ai raspuns la " + Session.get("counter") + " de intrebari: <b class='corect'>" + corect + "</b> corecte si <b class='wrong'>" + gresit + "</b> gresite ###</p><hr><ol></ol>");

    graph.push({gresit: gresit, corect: corect});
    if (graph.length >= 25) {
        graph.shift();
    }

    $('html, body').animate({
        scrollTop: $('footer').offset().top
    }, 'slow');

    drawChart();
    corect = 0;
    gresit = 0;
    Session.set('counter', 0);
}

Template.question.events({
    "submit form.answer": function (e, tpl) {
        e.preventDefault();
        var ans = tpl.$("input[name='answer']").val();
        var id = tpl.$("input[name='_id']").val();
        Meteor.call('questionAnswer', id, ans, function (error, response) {
            if (!error) {
                if (response.check == "true") {
                    $('ol:last').append("<li>" + Session.get('question').text + " - " + response.rasp + " - <b class='corect'>corect!</b> <span class='wrong' title='gresit'>" + response.gresit + "</span> <span class='corect' title='corecte'>" + response.corect + "</span></li>");
                    corect++;
                } else if (response.check == "pas") {
                    $('ol:last').append("<li>" + Session.get('question').text + " - " + response.rasp + " - <span class='wrong' title='gresite'>" + response.gresit + "</span> <span class='corect' title='corecte'>" + response.corect + "</span></li>");
                } else {
                    $('ol:last').append("<li>" + Session.get('question').text + " - " + response.rasp + " - <b class='wrong'>gresit!</b> <span class='wrong' title='gresite'>" + response.gresit + "</span> <span class='corect' title='corecte'>" + response.corect + "</span></li>");
                    gresit++;
                }
                Meteor.call('questionRandom', function (error, response) {
                    Session.set('question', response)
                });
                Session.set("counter", Session.get("counter") + 1);
                if (Session.get("counter") >= 10) {
                    result();
                }
            }
        });
    }
});