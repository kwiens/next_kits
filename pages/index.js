import { request } from '../lib/datocms'
import { Image, renderMetaTags } from 'react-datocms'
import Link from 'next/link'
import { LinkOverlay, Button, Flex, Center, Grid, SimpleGrid, GridItem, Box, Heading } from '@chakra-ui/react'

const HOMEPAGE_QUERY = `
query BatteryFixKits {
  allPromotions {
    id
    title
    subtitle
    promotionEntries {
      ... on FeaturedPromotionEntryRecord {
        id
   	  _modelApiKey
        title
        description
        link
        image {
          responsiveImage {
            srcSet
            webpSrcSet
            sizes
            src
            width
            height
            aspectRatio
            alt
            title
            base64
          }
        }
      }
      ... on ProductRecord {
        id
   	  _modelApiKey
        productcode
        optionid
      }
    }
  }
}`

export async function getStaticProps() {
  const data = await request({
    query: HOMEPAGE_QUERY,
    variables: { limit: 10 },
  })
  console.log(data)

  let entries = data.allPromotions[0].promotionEntries
  entries.sort((a, b) => { return a._modelApiKey === 'product' ? -1 : 1 })

  return {
    props: {
      entries,
    },
  }
}

export default function Home({ entries }) {
  return (
     <Center>
        <SimpleGrid minChildWidth="280px" spacing={20} maxWidth="1280px">
           {entries.map((entry) => (
             entry._modelApiKey === 'featured_promotion_entry' ? Featured(entry) : Product(entry)
           ))}
        </SimpleGrid>
     </Center>
  )
}

function Product(product) {
   return (
      <Box width="280px" minHeight="400px" key={product.id}>
         <Center>
            <Heading>{product.productcode}</Heading>
         </Center>
      </Box>
   )
}

function Featured(entry) {
   return (
      <Box width="1280px" key={entry.id}>
         <Grid
            templateRows="repeat(1, 1fr)"
            templateColumns="repeat(3, 1fr)"
         >
            <GridItem colSpan={2}>
               <Image data={entry.image.responsiveImage} />
            </GridItem>
            <GridItem colSpan={1} bg="blue.500" color="white">
               <Flex alignItems="center" justifyContent="center">
                  <Heading>{entry.title}</Heading>
                  <h3>{entry.description}</h3>
                  <Link href={entry.link}>
                     <Button variant="outline">Learn More</Button>
                  </Link>
               </Flex>
            </GridItem>
         </Grid>
      </Box>
   )
}
