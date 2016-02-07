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
          video_src: null
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

            $.ajax({
                url: '/vid',
                method: 'POST',
                data: {
                    id: self.youtube_id
                }
            }).done(function(data){
                self.video_src = 'http://subwoofer.mangohacks.com/uxpDa-c-4Mc/uxpDa-c-4Mc.mp4';
            });
        }
    },
    events: {
        'yt-vid-click': function(yt_id) {
            console.log(yt_id);
            this.video_src = 'http://subwoofer.mangohacks.com/'+yt_id+'/'+yt_id+'.mp4';
        }
    }
});


new Vue({
    el: '#app',
    data: function() {
        return {
            videos: videos
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
    }
});
