import React from "react"
import { Link } from "gatsby"

// Datos estáticos mientras la API no está disponible
const person = {
  name: "Luke Skywalker",
  height: "172",
  mass: "77",
  eyeColor: "blue",
  birthYear: "19BBY",
  homeworld: {
    name: "Tatooine"
  }
}

const ExamplePage: React.FC = () => {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <Link to="/">← Back to Home</Link>
      
      <h1>GraphQL Example: Character Details</h1>
      
      <div style={{ 
        marginTop: "2rem", 
        padding: "2rem", 
        border: "1px solid #ddd", 
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        <h2>{person.name}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <strong>Height:</strong> {person.height} cm
          </div>
          <div>
            <strong>Mass:</strong> {person.mass} kg
          </div>
          <div>
            <strong>Eye Color:</strong> {person.eyeColor}
          </div>
          <div>
            <strong>Birth Year:</strong> {person.birthYear}
          </div>
          <div>
            <strong>Homeworld:</strong> {person.homeworld.name}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
        <h3>💡 GraphQL Query Example</h3>
        <p>This page demonstrates how to:</p>
        <ul>
          <li>Query specific data from external GraphQL APIs</li>
          <li>Use TypeScript interfaces for type safety</li>
          <li>Access nested GraphQL data structures</li>
        </ul>
        <p style={{ marginTop: "1rem", fontStyle: "italic", color: "#856404" }}>
          Nota: Actualmente usando datos estáticos mientras la API externa no está disponible.
        </p>
      </div>
    </main>
  )
}

export default ExamplePage