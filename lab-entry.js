/* Dedicated LAB site: direct desktop match URLs also enter the full experiment. */
(() => {
 const url=new URL(location.href),ua=navigator.userAgent;
 const desktop=!/Android|iPhone|iPad|iPod|Silk|Fire TV|AFT/i.test(ua)&&!(/Macintosh/.test(ua)&&navigator.maxTouchPoints>0)&&navigator.userAgentData?.mobile!==true&&matchMedia('(any-pointer:fine)').matches&&matchMedia('(any-hover:hover)').matches;
 if(url.pathname.endsWith('/match.html')&&desktop&&!url.searchParams.has('mode')&&!url.searchParams.has('preview_device')){url.searchParams.set('mode','lab');history.replaceState(null,'',url)}
})();
