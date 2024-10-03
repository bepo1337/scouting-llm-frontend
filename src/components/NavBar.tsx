
import { Link } from '@radix-ui/react-navigation-menu'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from './ui/navigation-menu'

export default function NavBar() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <img className="h-12 rounded-sm" src="../../public/logo_crop.jpg" />
                </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList>
                <Link href="/">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Scouting as prompt ✨
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuList>
            <NavigationMenuList>
                <Link href="/compare">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Compare players ⚖
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuList>
            <NavigationMenuList>
                <Link href="/graph">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Player Network 
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuList>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="https://github.com/bepo1337/scouting-llm-frontend">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            <img className="w-10" src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" alt="" />
                            GitHub
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
