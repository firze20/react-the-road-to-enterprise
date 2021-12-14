import { useEffect, useState } from 'react'
import shallow from 'zustand/shallow'
import { EventsState, useEventsStore } from '../eventsStore'
import type { Event } from '../eventsTypes'
import EventsTabs, { EventTab } from './EventsTabs'

type DisplayEventsProps = {}

const pastAndUpcomingEventsSelector = (events: Event[]) => {
  const upcomingEvents: Event[] = []
  const pastEvents: Event[] = []
  for (const event of events) {
    const [day, month, year] = event.endDate
      .split('/')
      .map((item) => parseInt(item))
    const [hour, minute] = event.endTime.split(':')
    const isUpcoming =
      new Date(year, month - 1, day, parseInt(hour), parseInt(minute)) >
      new Date()
    if (isUpcoming) {
      upcomingEvents.push(event)
    } else {
      pastEvents.push(event)
    }
  }
  return {
    upcomingEvents,
    pastEvents,
  }
}

const useUpcomingAndPastEvents = (events: Event[]) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])

  useEffect(() => {
    const { upcomingEvents, pastEvents } = pastAndUpcomingEventsSelector(events)
    setUpcomingEvents(upcomingEvents)
    setPastEvents(pastEvents)
  }, [events])

  return { upcomingEvents, pastEvents, setUpcomingEvents, setPastEvents }
}
const DisplayEvents = (props: DisplayEventsProps) => {
  const [eventsToShow, setEventsToShow] = useState<EventTab>('all')
  const { allEvents, selectEvent } = useEventsStore(
    (state: EventsState) => ({
      allEvents: state.events,
      selectEvent: state.selectEvent,
    }),
    shallow
  )

  const { upcomingEvents, pastEvents } = useUpcomingAndPastEvents(allEvents)

  const eventsMap: Record<EventTab, Event[]> = {
    all: allEvents,
    upcoming: upcomingEvents,
    past: pastEvents,
  }

  const events = eventsMap[eventsToShow]

  return (
    <div>
      <h2 className="font-semibold text-xl mb-6">Events</h2>
      <EventsTabs activeTab={eventsToShow} setActiveTab={setEventsToShow} />
      <div className="mt-4">
        <ul className="text-left shadow py-4 space-y-3 divide-y">
          {Array.isArray(events) && events.length ? (
            events.map((event) => {
              return (
                <li key={event.id} className="-mt-3">
                  <button
                    className="hover:underline pt-3 px-4"
                    onClick={() => selectEvent(event.id)}
                  >
                    {event.title} - {event.startDate}
                  </button>
                </li>
              )
            })
          ) : (
            <p className="mx-4">No events</p>
          )}
        </ul>
      </div>
    </div>
  )
}

export default DisplayEvents
