(() => {
    const NEWS_API = 'https://hacker-news.firebaseio.com/v0';
    const STORY_COUNT = 6;

    function formatAge(timestamp) {
        const ageMinutes = Math.max(1, Math.floor((Date.now() - timestamp * 1000) / 60000));
        if (ageMinutes < 60) return `${ageMinutes} min ago`;
        const ageHours = Math.floor(ageMinutes / 60);
        if (ageHours < 24) return `${ageHours} hr ago`;
        return `${Math.floor(ageHours / 24)} days ago`;
    }

    async function fetchStories() {
        const response = await fetch(`${NEWS_API}/topstories.json`);
        if (!response.ok) throw new Error(`News request failed: ${response.status}`);
        const ids = await response.json();
        const stories = await Promise.all(ids.slice(0, STORY_COUNT).map(async (id) => {
            const storyResponse = await fetch(`${NEWS_API}/item/${id}.json`);
            if (!storyResponse.ok) return null;
            return storyResponse.json();
        }));
        return stories.filter(story => story && story.title && story.url);
    }

    function renderNews(stories) {
        const list = document.querySelector('[data-news-list]');
        const ticker = document.querySelector('[data-news-ticker]');
        const primaryStory = stories[0];

        if (list) {
            list.replaceChildren(...stories.slice(0, 3).map((story) => {
                const item = document.createElement('div');
                item.className = 'news-item';

                const time = document.createElement('small');
                time.textContent = formatAge(story.time);

                const link = document.createElement('a');
                link.href = story.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = story.title;
                link.style.color = 'inherit';
                link.style.textDecoration = 'none';

                item.append(time, link);
                return item;
            }));
        }

        if (ticker && primaryStory) {
            ticker.textContent = primaryStory.title;
            ticker.title = primaryStory.title;
            ticker.style.cursor = 'pointer';
            ticker.onclick = () => window.open(primaryStory.url, '_blank', 'noopener,noreferrer');
        }

        const primaryItem = document.querySelector('[data-news-primary]');
        const primaryTime = document.querySelector('[data-news-primary-time]');
        if (primaryItem && primaryStory) {
            primaryItem.textContent = primaryStory.title;
            primaryItem.href = primaryStory.url;
            primaryItem.target = '_blank';
            primaryItem.rel = 'noopener noreferrer';
        }
        if (primaryTime && primaryStory) primaryTime.textContent = formatAge(primaryStory.time);

        const timeline = document.querySelector('[data-news-timeline]');
        if (timeline) {
            timeline.querySelectorAll('.timeline-event').forEach((event, index) => {
                const story = stories[index % stories.length];
                if (!story) return;
                const icon = event.querySelector('i');
                event.replaceChildren(icon || document.createTextNode(''), document.createTextNode(` ${story.title}`));
                event.title = story.title;
                event.style.cursor = 'pointer';
                event.onclick = () => window.open(story.url, '_blank', 'noopener,noreferrer');
            });
        }
    }

    function showUnavailableState() {
        const list = document.querySelector('[data-news-list]');
        if (list) list.textContent = 'News unavailable';
        const primaryItem = document.querySelector('[data-news-primary]');
        if (primaryItem) primaryItem.textContent = 'News unavailable';
    }

    fetchStories().then(renderNews).catch((error) => {
        console.warn('[Aether News] Unable to load live headlines:', error);
        showUnavailableState();
    });
})();
