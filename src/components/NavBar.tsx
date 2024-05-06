
import { Link } from '@radix-ui/react-navigation-menu'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from './ui/navigation-menu'

export default function NavBar() {
    return (
        <NavigationMenu>
           
            <NavigationMenuList>
                <NavigationMenuItem>
                    <img className="h-12 rounded-sm" src="https://upload.wikimedia.org/wikipedia/commons/9/98/UHH_Universit%C3%A4t_Hamburg_Logo.svg"/>
                </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="https://github.com/bepo1337/scouting-llm-frontend">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            GitHub
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
