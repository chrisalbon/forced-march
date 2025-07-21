# Forced March

An experimental game exploring AI-generated game development based on visual inspiration. This project demonstrates how to use images to create a parallax effect of walking towards something.

## About This Experiment

This project began with a single inspiration GIF showing a fantasy scene of a warrior walking through a forest toward a distant village. Using AI assistance, we decoded the visual elements and recreated them as an interactive parallax walking experience.

### Original Inspiration

![Inspiration GIF](inspiration.gif)

*Credit: I don't know who to credit for this image.*

## Play the Game

🎮 **[Play Forced March](https://chrisalbon.github.io/forced-march/)**

Press **W** to walk forward, **S** to walk backward.

## Technical Implementation

### Parallax Effect
The game uses multiple depth layers to create the illusion of 3D movement:
- **Background Layer**: Static sky that fills the screen
- **Middle Layer**: Distant village that scales slowly
- **Field Layer**: Mid-ground elements using perspective projection
- **Tree Layers**: 8 unique foreground images that cycle infinitely

### Key Features
- **Perspective Projection**: Objects scale from a central vanishing point
- **Natural Walking**: Subtle bob and sway effects with 5% random speed variation
- **Infinite Scrolling**: Tree layers loop seamlessly for endless walking
- **Distance-Based Effects**: Closer objects shake more, distant objects barely move

### The Creative Process

1. **Visual Analysis**: Decoded the inspiration GIF into distinct depth layers
2. **Movement System**: Implemented scaling-based parallax instead of traditional scrolling
3. **Asset Generation**: Used AI to generate cohesive art assets matching the fantasy theme
4. **Fine-Tuning**: Adjusted positions, speeds, and effects through iterative testing

## Running Locally

```bash
# Clone the repository
git clone https://github.com/chrisalbon/forced-march.git
cd forced-march

# Open index.html in a browser or use a local server
python -m http.server 8000
# or
npx http-server
```

Then navigate to `http://localhost:8000`

## Project Structure

```
forced-march/
├── docs/               # GitHub Pages deployment
│   ├── index.html     # Main HTML file
│   ├── src/           # JavaScript source
│   ├── styles/        # CSS styles
│   └── *.png          # Game assets
├── src/               # Development source
├── styles/            # Development styles
└── *.png              # Original assets
```

## Insights from the Experiment

This project demonstrates:
- How AI can translate visual inspiration into functional code
- The effectiveness of perspective-based parallax for creating depth
- The importance of subtle effects (walking bob, speed variation) for immersion
- How simple 2D techniques can create compelling 3D-like experiences

## Technologies Used

- Vanilla JavaScript with Canvas API
- CSS for styling
- GitHub Pages for hosting
- AI assistance for code generation and asset creation

## License

This is an experimental project created for educational and demonstration purposes.

---

*Created as an experiment in AI-assisted game development*