export default function useVisitData() {
    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = 'https://cn.vercount.one/js'; // Vercount 接口
    document.head.appendChild(script);
}
