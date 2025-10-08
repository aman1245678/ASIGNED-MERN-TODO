export default function UserAvatar({ name }) {
    const letter = name ? name[0].toUpperCase() : '?';
    return (
        <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#ddd',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
        }}>
            {letter}
        </div>
    );
}
