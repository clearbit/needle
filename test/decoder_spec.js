var should  = require('should'),
    needle  = require('./../'),
    Q       = require('q'),
    chardet = require('jschardet');

describe('character encoding', function() {

  describe('when server send non-UTF8 data', function() {

    it('client should convert this to UTF-8', function(done) {

      // Our Needle wrapper that requests a chinese website.
      var task    = Q.nbind(needle.get, needle, 'http://www.chinesetop100.com/');

      // Different instantiations of this task
      var tasks   = [Q.fcall(task, {decode: true}),
                     Q.fcall(task, {decode: false})];

      var results = tasks.map(function(task) {
        return task.then(function(obj) {
          return obj[0].body;
        });
      });

      // Execute all requests concurrently
      Q.all(results).done(function(bodies) {

        var charsets = [
          chardet.detect(bodies[0]).encoding,
          chardet.detect(bodies[1]).encoding,
        ]

        // We wanted to decode our first stream.
        charsets[0].should.equal('ascii');
        bodies[0].indexOf('全球中文网站前二十强').should.not.equal(-1);

        // But not our second stream.
        charsets[1].should.equal('windows-1252');
        bodies[1].indexOf('全球中文网站前二十强').should.equal(-1);

        done();
      });
    })
  })
})
