jQuery(document).ready(function($) {

    /* ======= Scrollspy ======= */
    $('body').scrollspy({ target: '#header', offset: 400});

    /* ======= Fixed header when scrolled ======= */

    $(window).bind('scroll', function() {
         if ($(window).scrollTop() > 50) {
             $('#header').addClass('navbar-fixed-top');
         }
         else {
             $('#header').removeClass('navbar-fixed-top');
         }
    });

    /* ======= ScrollTo ======= */
    $('a.scrollto').on('click', function(e){

        //store hash
        var target = this.hash;

        e.preventDefault();

		$('body').scrollTo(target, 800, {offset: -70, 'axis':'y', easing:'easeOutQuad'});
        //Collapse mobile menu after clicking
		if ($('.navbar-collapse').hasClass('in')){
			$('.navbar-collapse').removeClass('in').addClass('collapse');
		}

	});

});

var videos = [
    {
        youtube_id: 'XAsPeY8BsQU',
        title: 'Darude - Sandstorm'
    },
    {
        youtube_id: 'ZXVhOPiM4mk',
        title: 'Heeeeeeeya'
    }
];

Vue.config.delimiters = ['<+','+>'];
Vue.config.unsafeDelimiters = ['<<<', '>>>'];

var YTInput = Vue.extend({
    template: '#yt_form_template',
    data: function () {
      return {
          youtube_url: null,
          video_src: null,
          loading: false,
          srt_src: null
      }
    },
    computed: {
        youtube_id: function() {
            return this.youtube_url.substring((this.youtube_url.indexOf('v=') + 2));
        }
    },
    methods: {
        onSubmit: function(event) {
            var self = this;
            event.preventDefault();

            console.log(self.youtube_id);
            self.loading = true;
            self.$dispatch('loading-start');
            var audio = new Audio('assets/bark.mp3');
            audio.loop = true;
            audio.play();
            $.ajax({
                url: '/youtube/'+self.youtube_id
            }).done(function(data){
                console.log(data);
                
                self.video_src = 'http://subwoofer.mangohacks.com/'+data.youtube_id+'/'+data.youtube_id+'.mp4';
                self.srt_src = 'http://subwoofer.mangohacks.com/'+data.youtube_id+'/'+data.youtube_id+'.vtt';
                self.$dispatch('video-added', {
                    youtube_id: data.youtube_id,
                    title: data.title,
                    thumb: data.thumb
                });
                audio.loop = false;
                audio.pause();
                self.loading = false;
                self.$dispatch('loading-done');
            });
        }
    },
    events: {
        'yt-vid-click': function(yt_id) {
            this.video_src = 'http://subwoofer.mangohacks.com/'+yt_id+'/'+yt_id+'.mp4';
            this.srt_src = 'http://subwoofer.mangohacks.com/'+yt_id+'/'+yt_id+'.vtt';
        }
    }
});


new Vue({
    el: '#app',
    data: function() {
        return {
            videos: videos,
            loading: false
        }
    },
    components: {
        'yt-input': YTInput
    },
    methods: {
        onVideoClick: function(yt_id, e) {
            e.preventDefault();
            this.$broadcast('yt-vid-click', yt_id);
        }
    },
    ready: function() {
        var self = this;

        $.ajax({
            url: 'http://subwoofer.mangohacks.com/videos',
            method: 'GET'
        }).done(function(data){
            console.log(data);
            self.videos = data;
        });
    },
    events: {
        'loading-start': function() {
            this.loading = true;
        },
        'loading-done': function() {
            this.loading = false;
        },
        'video-added': function(video_obj) {
            this.videos.push(video_obj);
        }
    }
});
