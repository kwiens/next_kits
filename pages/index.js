import { request } from '../lib/datocms'
import { Image, renderMetaTags } from 'react-datocms'
import Link from 'next/link'
import { LinkOverlay, Button, Flex, Center, Grid, SimpleGrid, GridItem, Box, Heading } from '@chakra-ui/react'
import algoliasearch from 'algoliasearch/lite';
import {
   InstantSearch,
   Hits,
   SearchBox,
   Pagination,
   Highlight,
   ClearRefinements,
   RefinementList,
   Configure,
 } from 'react-instantsearch-dom';

var searchClient = algoliasearch(
   "XQEP3AD9ZT",
   "118b51a67eefbe4d3c445d1e1090afac"
 );

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
            <Heading>{formatProductcode(product.productcode)}</Heading>
         </Center>

         {/*
            Amazingly, it was easier to throw a full blown search box in here to 
            display one result than to grab a single result directly
         */}
         <InstantSearch 
            indexName="shopify_ifixit_test_products" 
            query="spudger"
            searchClient={searchClient}
            >
         <SearchBox defaultRefinement={formatProductcode(product.productcode)} />

         <Configure hitsPerPage={1} />
         <Hits hitComponent={Hit} />
        </InstantSearch>
      </Box>
   )
}

function Hit(props) {
   return (
     <div>
       <img src={props.hit.image} align="left" alt={props.hit.name} />
       <div className="hit-name">
         <Highlight attribute="title" hit={props.hit} />
       </div>
       <div className="hit-sku">
         <Highlight attribute="sku" hit={props.hit} />
       </div>
       <div className="hit-description">
         <Highlight attribute="description" hit={props.hit} />
       </div>
       <div className="hit-price">${props.hit.price}</div>
     </div>
   );
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

function formatProductcode(num) {
   num = new String(num)
   return "IF" + num.substring(0,3) + "-" + num.substring(3,6)
}