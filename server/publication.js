/*
Meteor.publish('question', function() {
    return Question.find({}, {fields: {'_id':1, 'text':1}});
});
*/

Meteor.methods({
    questionAnswer: function(questiondId, answer){
        check(questiondId, String);
        check(answer, String);
        var ques = Questions.findOne({_id: questiondId});
        if(answer == "true" || answer == "True" || answer == "T" || answer == "t"){
            answer = "true";
        }
        if(answer == "false" || answer == "False" || answer == "F" || answer == "f"){
            answer = "false";
        }
        if(ques){
            if(answer == ques.answer.toString()) {
                Questions.update(questiondId, {$inc: {corect: 1}});
                return {check: "true", rasp: answer, gresit: ques.gresit, corect: ques.corect + 1};
            }else if(answer == ""){
                return {check: "pas", rasp: answer, gresit: ques.gresit, corect: ques.corect};
            }else{
                Questions.update(questiondId, {$inc: {gresit: 1}});
                return {check: "false", rasp: answer, gresit: ques.gresit+1, corect: ques.corect};
            }
        }else{
            throw new Meteor.Error("question-does-not-exist", "This question does not exist.");
        }
    },
    questionRandom: function(){
        var array = Questions.find({}, {fields: {'_id':1, 'text':1}}).fetch();
        var randomIndex = Math.floor( Math.random() * array.length );
        return array[randomIndex];
    }
});