Router.route('/', function () {
  this.render('index');
});

Views = [
	"menuSelection",
	"moveObject",
	"neckLesson",
	"operatingTable",
	"pitchPresent",
	"pitchWatch1stPerson",
	"present",
	"views",
	"watchPresentation1stPerson",
	"watchPresentationOwnPerspective",
	"displayMenu",
];

Views.forEach( function (page) {
	Router.route('/' + page, function () {
		this.layout('viewLayout');
		this.render(page);
	});
});