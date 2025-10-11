export function ThemeColorScript() {
  const script = `(()=>{try{const root=document.documentElement;const mql=window.matchMedia('(prefers-color-scheme: light)');const apply=(isLight)=>{root.dataset.mode=isLight?'light':'dark';};apply(mql.matches);mql.addEventListener('change',(event)=>apply(event.matches));}catch(e){console.warn('[theme]',e);}})();`;

  return (
    <script
      id="theme-color-script"
      dangerouslySetInnerHTML={{
        __html: script
      }}
    />
  );
}
