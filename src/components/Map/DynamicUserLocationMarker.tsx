'use client'

import dynamic from 'next/dynamic'

const UserLocationMarker = dynamic(() => import('./UserLocationMarker'), {
  ssr: false,
})

export default UserLocationMarker
