var eventId = 'rp14';

var fs = require('fs');
var path = require('path');

var allTracks = {
	'Business & Innovation':  { id:'business-innovation', label_de:'Business & Innovation',  label_en:'Business & Innovation', color:[194.0, 56.0, 24.0, 0.0] },
	'Science & Technology':   { id:'science-technology',  label_de:'Wissenschaft & Technik', label_en:'Science & Technology' , color:[0.0, 0.0, 0.0, 0.0] },
	'Politics & Society':     { id:'politics-society',    label_de:'Politik & Gesellschaft', label_en:'Politics & Society'   , color:[111.0, 79.0, 132.0, 0.0] },
	'Research & Education':   { id:'research-education',  label_de:'Forschung & Bildung',    label_en:'Research & Education' , color:[0.0, 0.0, 0.0, 1.0] },
	'Culture':                { id:'culture',             label_de:'Kultur',                 label_en:'Culture'              , color:[193.0, 117.0, 28.0, 1.0] },
	'Media':                  { id:'media',               label_de:'Medien',                 label_en:'Media'                , color:[78.0, 144.0, 178.0, 1.0] },
	're:publica':             { id:'republica',           label_de:'re:publica',             label_en:'re:publica'           , color:[0.0, 0.0, 0.0, 1.0] },
	're:campaign':            { id:'recampaign',          label_de:'re:campaign',            label_en:'re:campaign'          , color:[0.0, 0.0, 0.0, 1.0] },
	'Other':                  { id:'other',               label_de:'Other',                  label_en:'Other'                , color:[101.0, 156.0, 45.0, 1.0] }
}

var allFormats = {
	'Diskussion': { id:'discussion', label_de:'Diskussion', label_en:'Discussion' },
	'Vortrag':    { id:'talk',       label_de:'Vortrag',    label_en:'Talk'       },
	'Workshop':   { id:'workshop',   label_de:'Workshop',   label_en:'Workshop'   },
	'Aktion':     { id:'action',     label_de:'Aktion',     label_en:'Action'     }
}

var allLevels = {
	'Beginner':         { id:'beginner',     label_de:'Anfänger',         label_en:'Beginner'     },
	'Fortgeschrittene': { id:'intermediate', label_de:'Fortgeschrittene', label_en:'Intermediate' },
	'Experten':         { id:'advanced',     label_de:'Experten',         label_en:'Advanced'     }
};

var allLanguages = {
	'Englisch': { id:'en', label_de:'Englisch', label_en:'English' },
	'Deutsch':  { id:'de', label_de:'Deutsch',  label_en:'German'  }
};

var allDays = {
	'06.05.2014': { 'id':'1', 'label_de':'6. Mai', 'label_en':'6. May', 'date':'2014-05-06' },
	'07.05.2014': { 'id':'2', 'label_de':'7. Mai', 'label_en':'7. May', 'date':'2014-05-07' },
	'08.05.2014': { 'id':'3', 'label_de':'8. Mai', 'label_en':'8. May', 'date':'2014-05-08' },
};


exports.scrape = function (callback) {
	require('../lib/json_requester').get(
		{
			urls: {
				sessions: 'https://re-publica.de/event/1/sessions.json',
				speakers: 'https://re-publica.de/event/1/speakers.json',
				rooms:    'https://re-publica.de/event/1/rooms.json'
			}
		},
		function (result) {
			var data = [];

			var sessionList  = toArray(result.sessions.sessions);
			var speakerList  = toArray(result.speakers.speakers);
			var locationList = toArray(result.rooms.rooms      );

			sessionList.forEach(function (session) {
				session = session.session;
				var entry = {
					'id': 'rp14-session-' + session.nid,
					'title': session.title,
					'abstract': session.abstract,
					'description': '???',
					'url': session.url,
					'begin': parseDateTime(session.date, session.start),
					'end': parseDateTime(session.date, session.end),
					'duration': parseDuration(session.duration),
					'day': parseDate(session.date),
					'location': parseLocation(session.roomnid),
					'track': parseTrack(session.category),
					'format': parseFormat(session.format),
					'level': parseLevel(session.experience),
					'lang': parseLanguage(session.language),
					'speakers': parseSpeakers(session.speakeruid),
					'enclosures': [],
					'links': []
				}
				addEntry('session', entry);
			})

			speakerList.forEach(function (speaker) {
				speaker = speaker.speaker;
				var entry = {
					'id': 'rp14-speaker-'+speaker.uid,
					'name': speaker.speakername,
					'photo': speaker.picture,
					'url': speaker.url,
					'biography': speaker.bio,
					'organization': speaker.organization,
					'position': speaker.position,
					'sessions': [],
				}
				addEntry('speaker', entry);
			})

			locationList.forEach(function (location) {
				location = location.location;
				console.log(location);
				var entry = {
				}
				addEntry('location', entry);
			})

			alsoAdd('track', allTracks);
			alsoAdd('format', allFormats);
			alsoAdd('level', allLevels);
			alsoAdd('language', allLanguages);
			alsoAdd('day', allDays);

			checkSpeakerSessions();
			checkTracks();
			checkLocations();


			function checkSpeakerSessions() {}
			function checkTracks() {}
			function checkLocations() {}

			function addEntry(type, obj) {
				obj.event = eventId;
				obj.type = type;
				data.push(obj);
			}

			function alsoAdd(type, list) {
				Object.keys(list).forEach(function (key) {
					var obj = clone(list[key]);
					obj.event = eventId;
					obj.type = type;
					data.push(obj);
				})
			}

			//console.log(result);

			callback(data);
		}
	);
}

function toArray(obj) {
	return Object.keys(obj).map(function (key) { return obj[key] })
}

function parseDate(text) {
	switch (text) {
		case '': return false;
		default:
			console.log('Unknown date "'+text+'"')
			return false;
	}
}

function parseDateTime(date, time) {
	if ((date == '') && (time == '')) return false;
	console.log('Unknown date "'+date+'" and time "'+time+'"');
	return false
}

function parseDuration(text) {
	switch (text) {
		case '15 Minuten': return 15;
		case '30 Minuten': return 30;
		case '60 Minuten': return 60;
		case '90 Minuten': return 90;
		default:
			console.log('Unknown duration "'+text+'"')
			return false;
	}
}

function parseLocation(text) {
	switch (text) {
		case '': return false;
		default:
			console.log('Unknown location "'+text+'"')
			return false;
	}
}

function parseTrack(text) {
	var track = allTracks[text];
	if (track) return track;
	console.error('Unknown Track "'+text+'"');
	return false;
}

function parseFormat(text) {
	var format = allFormats[text];
	if (format) return format;
	console.error('Unknown Format "'+text+'"');
	return false;
}

function parseLevel(text) {
	var level = allLevels[text];
	if (level) return level;
	console.error('Unknown Level "'+text+'"');
	return false;
}

function parseLanguage(text) {
	var language = allLanguages[text];
	if (language) return language;
	console.error('Unknown Language "'+text+'"');
	return false;
}

function parseSpeakers(list) {
	return Object.keys(list).map(function (key) {
		return 'rp14-speaker-'+list[key]
	});
}

function clone(obj) {
	var newObj = {};
	Object.keys(obj).forEach(function (key) {
		newObj[key] = obj[key];
	})
	return newObj;
}