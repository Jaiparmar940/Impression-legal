// Video Carousel with Lazy Loading
class VideoCarousel {
  constructor(container) {
    this.container = container;
    this.currentSlide = 0;
    this.slides = [];
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.videoData = [
      { id: 'demo1', mp4: 'assets/animations/videos/demo1.mp4', webm: 'assets/animations/videos/demo1.webm', poster: 'assets/animations/posters/demo1-poster.jpg' },
      { id: 'demo2', mp4: 'assets/animations/videos/demo2.mp4', webm: 'assets/animations/videos/demo2.webm', poster: 'assets/animations/posters/demo2-poster.jpg' },
      { id: 'demo3', mp4: 'assets/animations/videos/demo3.mp4', webm: 'assets/animations/videos/demo3.webm', poster: 'assets/animations/posters/demo3-poster.jpg' }
    ];
    
    this.init();
  }
  
  init() {
    this.setupCarousel();
    this.setupTouchEvents();
    this.updateIndicators();
    this.loadCurrentSlide();
  }
  
  setupCarousel() {
    // Get the video cards
    this.slides = this.container.querySelectorAll('div[class*="bg-white"]');
    
    // Add indicators after the container
    const indicators = document.createElement('div');
    indicators.className = 'flex justify-center mt-4 space-x-2';
    indicators.innerHTML = `
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="0"></button>
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="1"></button>
      <button class="w-2 h-2 rounded-full bg-gray-300 transition-colors" data-slide="2"></button>
    `;
    
    this.container.parentNode.insertBefore(indicators, this.container.nextSibling);
    
    // Make container overflow hidden
    this.container.style.overflow = 'hidden';
    
    // Make slides full width and hide non-active ones
    this.slides.forEach((slide, index) => {
      slide.style.minWidth = '100%';
      slide.style.width = '100%';
      slide.style.flexShrink = '0';
      slide.style.flexGrow = '0';
      
      if (index !== 0) {
        slide.style.display = 'none';
      }
    });
    
    // Add indicator click handlers
    const indicatorButtons = indicators.querySelectorAll('button');
    indicatorButtons.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }
  
  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.currentX = this.startX;
    });
    
    this.container.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      this.currentX = e.touches[0].clientX;
      const diff = this.currentX - this.startX;
      
      // Visual feedback during drag
      if (Math.abs(diff) > 10) {
        const currentSlide = this.slides[this.currentSlide];
        const nextSlide = this.slides[this.currentSlide + 1];
        const prevSlide = this.slides[this.currentSlide - 1];
        
        if (diff > 0 && prevSlide) {
          prevSlide.style.display = 'block';
          prevSlide.style.transform = `translateX(${diff}px)`;
        } else if (diff < 0 && nextSlide) {
          nextSlide.style.display = 'block';
          nextSlide.style.transform = `translateX(${diff}px)`;
        }
      }
    });
    
    this.container.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      const diff = this.currentX - this.startX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && this.currentSlide > 0) {
          this.goToSlide(this.currentSlide - 1);
        } else if (diff < 0 && this.currentSlide < this.slides.length - 1) {
          this.goToSlide(this.currentSlide + 1);
        } else {
          this.goToSlide(this.currentSlide);
        }
      } else {
        this.goToSlide(this.currentSlide);
      }
    });
  }
  
  goToSlide(index) {
    // Pause current slide video
    this.pauseCurrentSlide();
    
    this.currentSlide = Math.max(0, Math.min(index, this.slides.length - 1));
    
    // Hide all slides
    this.slides.forEach(slide => {
      slide.style.display = 'none';
      slide.style.transform = '';
    });
    
    // Show current slide
    this.slides[this.currentSlide].style.display = 'block';
    
    this.updateIndicators();
    this.loadCurrentSlide();
  }
  
  pauseCurrentSlide() {
    const currentSlide = this.slides[this.currentSlide];
    const video = currentSlide.querySelector('video');
    if (video) {
      video.pause();
    }
  }
  
  loadCurrentSlide() {
    const currentSlide = this.slides[this.currentSlide];
    const videoContainer = currentSlide.querySelector('[data-lazy-video]');
    
    if (!videoContainer) return;
    
    // Get video data for current slide
    const videoData = this.videoData[this.currentSlide];
    
    // Create video element if it doesn't exist
    let video = videoContainer.querySelector('video');
    if (!video) {
      video = document.createElement('video');
      video.className = 'w-full h-full object-cover';
      
      // Essential attributes for autoplay and no controls
      video.setAttribute('muted', 'true');
      video.setAttribute('loop', 'true');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-player-fullscreen', 'false');
      video.setAttribute('preload', 'metadata');
      video.setAttribute('controls', 'false');
      video.setAttribute('poster', videoData.poster);
      
      // iOS-specific attributes to prevent controls
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('x-webkit-airplay', 'allow');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-player-fullscreen', 'false');
      video.setAttribute('x5-video-orientation', 'portraint');
      video.setAttribute('x5-video-ignore-metadata', 'true');
      
      // Disable all interactions that might show controls
      video.setAttribute('disablePictureInPicture', 'true');
      video.setAttribute('disableRemotePlayback', 'true');
      
      // Add sources
      const webmSource = document.createElement('source');
      webmSource.src = videoData.webm;
      webmSource.type = 'video/webm';
      video.appendChild(webmSource);
      
      const mp4Source = document.createElement('source');
      mp4Source.src = videoData.mp4;
      mp4Source.type = 'video/mp4';
      video.appendChild(mp4Source);
      
      // Add fallback image
      const fallbackImg = document.createElement('img');
      fallbackImg.src = videoData.poster;
      fallbackImg.alt = 'Video poster';
      fallbackImg.className = 'w-full h-full object-cover';
      video.appendChild(fallbackImg);
      
      // Add video to container
      videoContainer.innerHTML = '';
      videoContainer.appendChild(video);
      
      // Setup video events
      this.setupVideoEvents(video);
    }
    
    // Load and play video
    video.load();
    this.attemptPlay(video);
  }
  
  setupVideoEvents(video) {
    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });
    
    video.addEventListener('canplay', () => {
      this.attemptPlay(video);
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
    });
    
    // iOS-specific: Prevent any interactions that might show controls
    video.addEventListener('webkitbeginfullscreen', (e) => {
      e.preventDefault();
      return false;
    });
    
    video.addEventListener('webkitendfullscreen', (e) => {
      e.preventDefault();
      return false;
    });
    
    video.addEventListener('webkitfullscreenchange', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Prevent context menu on video
    video.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Prevent any touch interactions that might show controls
    video.addEventListener('touchstart', (e) => {
      // Only allow our custom play attempt
      this.attemptPlay(video);
      e.preventDefault();
      return false;
    });
    
    video.addEventListener('touchend', (e) => {
      e.preventDefault();
      return false;
    });
    
    video.addEventListener('touchmove', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Prevent click events that might show controls
    video.addEventListener('click', (e) => {
      this.attemptPlay(video);
      e.preventDefault();
      return false;
    });
    
    // Prevent double-tap to zoom
    video.addEventListener('dblclick', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Mobile-specific play attempts
    if (this.isMobile()) {
      video.addEventListener('touchstart', () => {
        this.attemptPlay(video);
      });
      
      video.addEventListener('click', () => {
        this.attemptPlay(video);
      });
    }
  }
  
  attemptPlay(video) {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video playing successfully');
        })
        .catch(error => {
          console.log('Autoplay failed:', error.message);
          // Add play button for mobile if autoplay fails
          if (this.isMobile()) {
            this.addPlayButton(video);
          }
        });
    }
  }
  
  addPlayButton(video) {
    const container = video.parentElement;
    if (container.querySelector('.mobile-play-button')) return;
    
    const playButton = document.createElement('div');
    playButton.className = 'mobile-play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-20';
    playButton.innerHTML = `
      <div class="bg-white rounded-full p-3">
        <svg class="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
        </svg>
      </div>
    `;
    
    playButton.addEventListener('click', () => {
      video.play().then(() => {
        playButton.remove();
      }).catch(e => {
        console.log('Manual play failed:', e);
      });
    });
    
    container.appendChild(playButton);
  }
  
  updateIndicators() {
    const indicators = this.container.parentNode.querySelector('.flex.justify-center');
    if (!indicators) return;
    
    const indicatorButtons = indicators.querySelectorAll('button');
    indicatorButtons.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.remove('bg-gray-300');
        indicator.classList.add('bg-indigo-600');
      } else {
        indicator.classList.remove('bg-indigo-600');
        indicator.classList.add('bg-gray-300');
      }
    });
  }
  
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }
}

// Auto-initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const videoSection = document.querySelector('#video-carousel');
  if (videoSection) {
    new VideoCarousel(videoSection);
  }
}); 