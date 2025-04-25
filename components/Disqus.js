import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect } from 'react'

const DisqusComponent = ({ frontMatter }) => {
    const { isDarkMode } = useGlobal()
    
    useEffect(() => {
        // Check if Disqus shortname is configured
        const disqusShortname = siteConfig('COMMENT_DISQUS_SHORTNAME')
        if (!disqusShortname) {
            console.error('Disqus shortname is not configured')
            return
        }
        
        // Load Disqus script
        const loadDisqus = () => {
            // Reset Disqus if it's already loaded (useful when navigating between pages)
            if (window.DISQUS) {
                window.DISQUS.reset({
                    reload: true,
                    config: function() {
                        this.page.url = window.location.href;
                        this.page.identifier = window.location.pathname;
                        this.page.title = document.title;
                        
                        // Add language configuration if available
                        const disqusLang = siteConfig('COMMENT_DISQUS_LANG');
                        if (disqusLang) {
                            this.language = disqusLang;
                        }
                    }
                });
                return;
            }
            
            window.disqus_config = function() {
                this.page.url = window.location.href;
                this.page.identifier = window.location.pathname;
                if (frontMatter?.title) {
                    this.page.title = frontMatter.title;
                }
                
                // Add language configuration if available
                const disqusLang = siteConfig('COMMENT_DISQUS_LANG');
                if (disqusLang) {
                    this.language = disqusLang;
                }
            };
            
            const script = document.createElement('script');
            script.src = `https://${disqusShortname}.disqus.com/embed.js`;
            script.setAttribute('data-timestamp', +new Date());
            script.async = true;
            document.head.appendChild(script);
        }
        
        loadDisqus();
        
        // Clean up
        return () => {
            // Remove script when component unmounts
            const disqusScript = document.querySelector('script[src*="disqus.com/embed.js"]');
            if (disqusScript) {
                disqusScript.remove();
            }
            
            // Reset DISQUS if it exists
            if (window.DISQUS) {
                window.DISQUS.reset();
            }
        };
    }, [frontMatter]);

    // Apply theme changes when dark mode changes
    useEffect(() => {
        if (window.DISQUS && isDarkMode !== undefined) {
            try {
                // Try to update the Disqus theme
                const theme = isDarkMode ? 'dark' : 'light';
                document.getElementById('disqus_thread')?.classList.toggle('dark-theme', isDarkMode);
                document.getElementById('disqus_thread')?.classList.toggle('light-theme', !isDarkMode);
            } catch (e) {
                console.error('Failed to update Disqus theme', e);
            }
        }
    }, [isDarkMode]);

    return (
        <div id="disqus_thread" className={isDarkMode ? 'dark-theme' : 'light-theme'}></div>
    )
}

export default DisqusComponent
