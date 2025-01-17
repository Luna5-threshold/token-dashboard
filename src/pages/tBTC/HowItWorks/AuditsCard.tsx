import { FC, ComponentProps } from "react"
import { List } from "@chakra-ui/react"
import { LabelSm, Card } from "@threshold-network/components"
import DetailedLinkListItem from "../../../components/DetailedLinkListItem"

export const AuditsCard: FC<ComponentProps<typeof Card>> = (props) => {
  return (
    <Card {...props}>
      <LabelSm mb={5}>Audit Reports</LabelSm>
      <List mt="5" spacing="6">
        {contracts.map((contract) => (
          <DetailedLinkListItem {...contract} />
        ))}
      </List>
    </Card>
  )
}

const contracts = [
  {
    title: "Spearbit",
    href: "NEED_URL",
  },
  {
    title: "Audit Bridge",
    href: "NEED_URL",
  },
]
