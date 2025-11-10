
Nov 10 11:10:45.78
GET
200
www.protenders.co.za
/api/admin/sync/state
7
prisma:error Invalid `prisma.jobLog.count()` invocation: Timed out fetching a new connection from the connection pool. More info: http://pris.ly/d/connection-pool (Current connection pool timeout: 20, connection limit: 10)
Nov 10 11:10:15.78
GET
500
www.protenders.co.za
/api/admin/jobs
9
Error fetching job logs: Error [PrismaClientKnownRequestError]: Invalid `prisma.jobLog.count()` invocation: Server has closed the connection. at async z (.next/server/app/api/admin/jobs/route.js:1:3495) at async k (.next/server/app/api/admin/jobs/route.js:1:7348) { code: 'P1017', meta: [Object], clientVersion: '6.18.0' }
Nov 10 11:10:15.78
GET
500
www.protenders.co.za
/api/admin/sync/state
10
Error fetching sync state: Error [PrismaClientKnownRequestError]: Invalid `prisma.syncState.findUnique()` invocation: Server has closed the connection. at async z (.next/server/app/api/admin/sync/state/route.js:1:2631) at async k (.next/server/app/api/admin/sync/state/route.js:1:7594) at async g (.next/server/app/api/admin/sync/state/route.js:1:8597) { code: 'P1017', meta: [Object], clientVersion: '6.18.0' }
Nov 10 11:10:15.78
GET
500
www.protenders.co.za
/api/admin/enrichment/progress
3
Enrichment progress failed: Error [PrismaClientKnownRequestError]: Invalid `prisma.$queryRaw()` invocation: Server has closed the connection. at async B (.next/server/app/api/admin/enrichment/progress/route.js:1:3433) at async C (.next/server/app/api/admin/enrichment/progress/route.js:19:303) at async k (.next/server/app/api/admin/enrichment/progress/route.js:19:3550) { code: 'P1017', meta: null, clientVersion: '6.18.0' }
Nov 10 11:09:45.78
GET
500
www.protenders.co.za
/api/admin/sync/state
3
Error fetching sync state: Error [PrismaClientKnownRequestError]: Invalid `prisma.syncState.findUnique()` invocation: Server has closed the connection. at async z (.next/server/app/api/admin/sync/state/route.js:1:2631) at async k (.next/server/app/api/admin/sync/state/route.js:1:7594) at async g (.next/server/app/api/admin/sync/state/route.js:1:8597) { code: 'P1017', meta: [Object], clientVersion: '6.18.0' }
Nov 10 11:09:45.78
GET
500
www.protenders.co.za
/api/admin/jobs
5
Error fetching job logs: Error [PrismaClientKnownRequestError]: Invalid `prisma.jobLog.count()` invocation: Server has closed the connection. at async z (.next/server/app/api/admin/jobs/route.js:1:3495) at async k (.next/server/app/api/admin/jobs/route.js:1:7348) { code: 'P1017', meta: [Object], clientVersion: '6.18.0' }
Nov 10 11:09:45.78
GET
500
www.protenders.co.za
/api/admin/enrichment/progress
5
Enrichment progress failed: Error [PrismaClientKnownRequestError]: Invalid `prisma.$queryRaw()` invocation: Server has closed the connection. at async B (.next/server/app/api/admin/enrichment/progress/route.js:1:3433) at async C (.next/server/app/api/admin/enrichment/progress/route.js:19:303) at async k (.next/server/app/api/admin/enrichment/progress/route.js:19:3550) { code: 'P1017', meta: null, clientVersion: '6.18.0' }
Nov 10 11:09:30.75
GET
200
www.protenders.co.za
/api/auth/session
Nov 10 11:09:30.18
GET
200
www.protenders.co.za
/api/auth/session
Nov 10 11:09:16.11
GET
200
www.protenders.co.za
/api/admin/sync/state
[admin] / status=200
Nov 10 11:09:16.11
GET
200
www.protenders.co.za
/api/admin/jobs
2
Job logs fetched in 293ms
Nov 10 11:09:16.11
GET
200
www.protenders.co.za
/api/admin/enrichment/progress
[admin] / status=200
Nov 10 11:08:59.80
POST
504
www.protenders.co.za
/api/admin/jobs/enrich-today
105
Vercel Runtime Timeout Error: Task timed out after 300 seconds