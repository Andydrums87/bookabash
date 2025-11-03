import { NextResponse } from 'next/server'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const date = searchParams.get('date')

    console.log('Weather API called with:', { location, date })

    if (!location || !date) {
      console.log('Missing location or date')
      return NextResponse.json(
        { error: 'Location and date are required' },
        { status: 400 }
      )
    }

    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key not configured')
      return NextResponse.json(
        { error: 'Weather service not configured' },
        { status: 500 }
      )
    }

    console.log('API key found, proceeding with request')

    // Extract postcode from location string (could be full address or just postcode)
    const postcodeMatch = location.match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/i)
    const postcode = postcodeMatch ? postcodeMatch[0] : location

    // Geocode the UK postcode
    const geoUrl = `http://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(postcode)},GB&appid=${OPENWEATHER_API_KEY}`

    const geoResponse = await fetch(geoUrl)

    if (!geoResponse.ok) {
      console.error('Geocoding failed:', await geoResponse.text())
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    const geoData = await geoResponse.json()
    const { lat, lon, name } = geoData

    // Calculate days until party
    const partyDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    partyDate.setHours(0, 0, 0, 0)
    const daysUntil = Math.ceil((partyDate - today) / (1000 * 60 * 60 * 24))

    let weatherData

    if (daysUntil <= 5) {
      // Use 5-day forecast API for near-term dates
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`

      const forecastResponse = await fetch(forecastUrl)

      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data')
      }

      const forecastData = await forecastResponse.json()

      // Find the forecast closest to party date at midday
      const targetDate = new Date(date)
      targetDate.setHours(12, 0, 0, 0)

      const closestForecast = forecastData.list.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.dt * 1000) - targetDate)
        const currDiff = Math.abs(new Date(curr.dt * 1000) - targetDate)
        return currDiff < prevDiff ? curr : prev
      })

      weatherData = {
        temp: closestForecast.main.temp,
        feelsLike: closestForecast.main.feels_like,
        condition: closestForecast.weather[0].description,
        rainChance: (closestForecast.pop || 0) * 100,
        windSpeed: Math.round(closestForecast.wind.speed * 2.237), // m/s to mph
        location: name || location,
        isForecast: true,
        daysUntil
      }
    } else if (daysUntil === 0) {
      // Use current weather for today
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`

      const currentResponse = await fetch(currentUrl)

      if (!currentResponse.ok) {
        throw new Error('Failed to fetch current weather')
      }

      const currentData = await currentResponse.json()

      weatherData = {
        temp: currentData.main.temp,
        feelsLike: currentData.main.feels_like,
        condition: currentData.weather[0].description,
        rainChance: currentData.rain ? 100 : 0,
        windSpeed: Math.round(currentData.wind.speed * 2.237), // m/s to mph
        location: name || location,
        isForecast: false,
        daysUntil
      }
    } else {
      // For dates beyond 5 days, use historical averages or current conditions as estimate
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`

      const currentResponse = await fetch(currentUrl)

      if (!currentResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const currentData = await currentResponse.json()

      weatherData = {
        temp: currentData.main.temp,
        feelsLike: currentData.main.feels_like,
        condition: currentData.weather[0].description,
        rainChance: 30, // Estimate for UK
        windSpeed: Math.round(currentData.wind.speed * 2.237),
        location: name || location,
        isForecast: true,
        daysUntil
      }
    }

    console.log('Returning weather data:', weatherData)
    return NextResponse.json(weatherData)

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
