'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { TOKEN_PRICING } from '@/lib/constants'
import { generateTokenReceipt } from '@/lib/pdf/generate-pdf'

type StitchPageRendererProps = {
  routeKey: string
}

type PosOrderItem = {
  id: string
  price: number
  tokens: number
  label: string
  quantity: number
}

type PaymentMethod = 'cash' | 'card'

const SHELL_ROUTE_KEY = 'dashboard'

const stitchRouteMap: Record<string, string> = {
  dashboard: 'dashboard',
  pos: 'pos',
  tokens: 'tokens',
  inventory: 'inventory',
  bookings: 'bookings',
  'work-orders': 'work-orders',
  machines: 'machines',
  customers: 'customers',
  employees: 'employees',
  expenses: 'expenses',
  coupons: 'coupons',
  reports: 'reports',
  documents: 'documents',
}

const stitchLinkMap: Record<string, string> = {
  dashboard: 'dashboard',
  pos: 'pos',
  token: 'tokens',
  transactions: 'tokens',
  inventory: 'inventory',
  prize: 'inventory',
  bookings: 'bookings',
  'work orders': 'work-orders',
  machines: 'machines',
  customers: 'customers',
  employee: 'employees',
  employees: 'employees',
  expenses: 'expenses',
  coupons: 'coupons',
  reports: 'reports',
  documents: 'documents',
}

const sidebarMatchers: Record<string, string[]> = {
  dashboard: ['dashboard'],
  pos: ['pos', 'token sales'],
  tokens: ['token transactions', 'transactions'],
  inventory: ['prize inventory', 'inventory'],
  bookings: ['bookings'],
  'work-orders': ['work orders'],
  machines: ['machines'],
  customers: ['customers'],
  employees: ['employee'],
  expenses: ['expenses'],
  coupons: ['coupons'],
  reports: ['reports'],
  documents: ['documents'],
}

const ADMIN_PAGE_TRANSITION_STYLE_ID = 'admin-page-transition-style'

const ensureAdminTransitionStyles = (iframeDoc: Document) => {
  if (iframeDoc.getElementById(ADMIN_PAGE_TRANSITION_STYLE_ID)) {
    return
  }

  const style = iframeDoc.createElement('style')
  style.id = ADMIN_PAGE_TRANSITION_STYLE_ID
  style.textContent = `
    @keyframes public-page-slide-in {
      from {
        opacity: 0;
        transform: translate3d(18px, 0, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    .public-page-transition {
      animation: public-page-slide-in 220ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform, opacity;
    }

    @media (prefers-reduced-motion: reduce) {
      .public-page-transition {
        animation: none;
      }
    }
  `

  iframeDoc.head.appendChild(style)
}

export function StitchPageRenderer({ routeKey }: StitchPageRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [activeRouteKey, setActiveRouteKey] = useState(routeKey)
  const [shellReady, setShellReady] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const posOrderRef = useRef<PosOrderItem[]>([])
  const posPaymentMethodRef = useRef<PaymentMethod>('cash')
  const posSelectedPackRef = useRef<number | null>(null)

  // Fetch user profile data once
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return

      const supabase = createClient()
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setUserData(data)
      }
    }

    fetchUserData()
  }, [user?.id])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const navigateToSection = (nextRouteKey: string) => {
    setActiveRouteKey(nextRouteKey)
    window.history.replaceState(null, '', `/admin/dashboard?section=${nextRouteKey}`)
  }

  useEffect(() => {
    if (stitchRouteMap[routeKey]) {
      setActiveRouteKey(routeKey)
    }
  }, [routeKey])

  const loadSectionContent = async (nextRouteKey: string) => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) return

      const response = await fetch(`/stitch/admin/${nextRouteKey}/content.html`, {
        cache: 'no-store',
      })
      const html = await response.text()
      const parser = new DOMParser()
      const parsedDoc = parser.parseFromString(html, 'text/html')
      const parsedMain = parsedDoc.querySelector('main')
      const shellMain = iframeDoc.querySelector('main')

      if (!parsedMain || !shellMain) return

      ensureAdminTransitionStyles(iframeDoc)

      parsedMain.querySelectorAll('header').forEach((header) => header.remove())
      parsedMain.querySelectorAll('footer').forEach((footer) => footer.remove())

      const fragment = iframeDoc.createDocumentFragment()
      Array.from(parsedMain.children).forEach((child) => {
        const clonedChild = child.cloneNode(true) as HTMLElement

        clonedChild.classList.remove('pt-24', 'pt-28', 'ml-64', 'ml-72', 'min-h-screen', 'h-screen', 'flex-1')
        if (!clonedChild.classList.contains('pt-0') && !clonedChild.classList.contains('pt-8')) {
          clonedChild.classList.add('pt-0')
        }

        fragment.appendChild(clonedChild)
      })

      const transitionWrapper = iframeDoc.createElement('div')
      transitionWrapper.className = 'public-page-transition'
      transitionWrapper.appendChild(fragment)

      shellMain.innerHTML = ''
      shellMain.appendChild(transitionWrapper)

      personalizeIframe()
      syncSidebarActiveState(nextRouteKey)
      enhanceDashboardActions(nextRouteKey)
      if (nextRouteKey === 'pos') {
        enhancePosSales()
      } else {
        resetPosState()
      }
    } catch (error) {
      console.log('Unable to load section content', error)
    }
  }

  const syncSidebarActiveState = (nextRouteKey: string) => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    const navLinks = iframeDoc.querySelectorAll('aside nav a')
    const matchers = sidebarMatchers[nextRouteKey] || []

    navLinks.forEach((link) => {
      const element = link as HTMLElement
      const text = (element.textContent || '').toLowerCase().trim()
      const isActive = matchers.some((matcher) => text.includes(matcher))

      element.classList.remove('active-tab', 'font-bold')
      element.classList.add('text-gray-500', 'rounded-lg')

      if (isActive) {
        element.classList.add('active-tab', 'font-bold')
        element.classList.remove('text-gray-500')
      }
    })
  }

  const enhanceDashboardActions = (nextRouteKey: string) => {
    if (nextRouteKey !== 'dashboard') return

    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    const quickActionButtons = iframeDoc.querySelectorAll('button')
    quickActionButtons.forEach((button) => {
      const text = (button.textContent || '').toLowerCase()

      if (text.includes('new sale')) {
        ;(button as HTMLButtonElement).onclick = () => navigateToSection('pos')
      }

      if (text.includes('new booking')) {
        ;(button as HTMLButtonElement).onclick = () => navigateToSection('bookings')
      }

      if (text.includes('add prize')) {
        ;(button as HTMLButtonElement).onclick = () => navigateToSection('inventory')
      }

      if (text.includes('work order')) {
        ;(button as HTMLButtonElement).onclick = () => navigateToSection('work-orders')
      }
    })
  }

  const resetPosState = () => {
    posOrderRef.current = []
    posPaymentMethodRef.current = 'cash'
    posSelectedPackRef.current = null
  }

  const getPosPackageButtons = (iframeDoc: Document) => {
    return Array.from(iframeDoc.querySelectorAll('div.grid.grid-cols-2.gap-6.flex-1 > button')) as HTMLButtonElement[]
  }

  const getPosPaymentButtons = (iframeDoc: Document) => {
    return Array.from(iframeDoc.querySelectorAll('div.grid.grid-cols-2.gap-3.mt-6 > button')) as HTMLButtonElement[]
  }

  const getPosItemsContainer = (iframeDoc: Document) => {
    return iframeDoc.querySelector('div.flex-1.overflow-y-auto.p-8.space-y-6') as HTMLElement | null
  }

  const getPosTransactionElement = (iframeDoc: Document) => {
    return Array.from(iframeDoc.querySelectorAll('p')).find((element) => {
      return (element.textContent || '').toLowerCase().includes('transaction id:')
    }) as HTMLElement | undefined
  }

  const setPackageButtonTheme = (button: HTMLElement, selected: boolean) => {
    const badge = button.querySelector('div.z-10 span') as HTMLElement | null
    const price = button.querySelector('h2') as HTMLElement | null
    const tokenCount = button.querySelector('p') as HTMLElement | null
    const actionRow = button.querySelector('div.flex.items-center.gap-2') as HTMLElement | null

    button.classList.toggle('bg-primary', selected)
    button.classList.toggle('text-on-primary', selected)
    button.classList.toggle('shadow-2xl', selected)
    button.classList.toggle('border-primary-dim', selected)
    button.classList.toggle('bg-white', !selected)

    if (selected) {
      button.style.boxShadow = '0 25px 50px -12px rgba(187, 1, 0, 0.25)'
    } else {
      button.style.boxShadow = ''
    }

    if (badge) {
      badge.classList.toggle('bg-white', selected)
      badge.classList.toggle('text-primary', selected)
    }

    if (price) {
      price.classList.toggle('text-white', selected)
      price.classList.toggle('text-on-surface', !selected)
    }

    if (tokenCount) {
      tokenCount.classList.toggle('text-white', selected)
      tokenCount.classList.toggle('text-primary-dim', !selected)
    }

    if (actionRow) {
      actionRow.classList.toggle('text-white/70', selected)
      actionRow.classList.toggle('text-stone-400', !selected)
      actionRow.classList.toggle('group-hover:text-primary', !selected)
    }
  }

  const renderPosReceipt = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    const orderItems = posOrderRef.current
    const itemsContainer = getPosItemsContainer(iframeDoc) || undefined
    const totalAmountElement = iframeDoc.querySelector('span.font-epilogue.font-black.text-5xl') as HTMLElement | null
    const totalTokensElement = iframeDoc.querySelector('p.text-2xl.font-black.font-epilogue.text-primary.italic') as HTMLElement | null
    const transactionElement = getPosTransactionElement(iframeDoc)

    const subtotalRows = Array.from(iframeDoc.querySelectorAll('div.flex.justify-between')).filter((element) => {
      return (element.textContent || '').toLowerCase().includes('subtotal') || (element.textContent || '').toLowerCase().includes('factory tax')
    }) as HTMLElement[]

    const orderTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tokenTotal = orderItems.reduce((sum, item) => sum + item.tokens * item.quantity, 0)

    if (itemsContainer) {
      itemsContainer.innerHTML = ''

      if (orderItems.length === 0) {
        const emptyState = iframeDoc.createElement('div')
        emptyState.className = 'flex flex-1 flex-col items-center justify-center py-10 opacity-30'
        emptyState.innerHTML = `
          <span class="material-symbols-outlined text-6xl">shopping_basket</span>
          <p class="text-[10px] uppercase tracking-widest font-black mt-2">Assembly Line</p>
          <div class="h-px w-32 bg-primary mt-4"></div>
        `
        itemsContainer.appendChild(emptyState)
      } else {
        orderItems.forEach((item) => {
          const row = iframeDoc.createElement('div')
          row.className = 'flex items-center justify-between group border-b border-neutral-100 pb-4'
          row.innerHTML = `
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center font-black font-epilogue text-sm">${item.quantity}x</div>
              <div>
                <p class="font-bold text-sm text-on-surface">${item.label}</p>
                <p class="text-[10px] font-medium text-stone-500 uppercase tracking-wider">${item.tokens * item.quantity} Tokens Added</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="remove-order-item text-stone-400 hover:text-primary transition-colors" data-item-id="${item.id}" aria-label="Remove item">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
              <div class="text-right">
                <p class="font-black font-epilogue text-sm">$${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          `
          itemsContainer.appendChild(row)
        })

        itemsContainer.querySelectorAll('.remove-order-item').forEach((button) => {
          ;(button as HTMLButtonElement).onclick = () => {
            const itemId = (button as HTMLButtonElement).dataset.itemId
            posOrderRef.current = posOrderRef.current.filter((item) => item.id !== itemId)
            renderPosReceipt()
          }
        })
      }
    }

    if (subtotalRows[0]) {
      const value = subtotalRows[0].querySelector('span:last-child')
      if (value) value.textContent = `$${orderTotal.toFixed(2)}`
    }

    if (subtotalRows[1]) {
      const value = subtotalRows[1].querySelector('span:last-child')
      if (value) value.textContent = '$0.00'
    }

    if (totalAmountElement) {
      totalAmountElement.textContent = `$${orderTotal.toFixed(2)}`
    }

    if (totalTokensElement) {
      totalTokensElement.textContent = tokenTotal.toString()
    }

    if (transactionElement) {
      transactionElement.textContent = `Transaction ID: ${orderItems.length > 0 ? 'READY TO COMPLETE' : 'PENDING'}`
    }
  }

  const renderPosSelectionState = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    const packageButtons = getPosPackageButtons(iframeDoc)

    packageButtons.forEach((button, index) => {
      const selected = posSelectedPackRef.current === index
      setPackageButtonTheme(button, selected)
    })

    const paymentButtons = getPosPaymentButtons(iframeDoc)

    paymentButtons.forEach((button) => {
      const text = (button.textContent || '').toLowerCase().trim()
      const selected = text === posPaymentMethodRef.current
      button.classList.toggle('bg-primary', selected)
      button.classList.toggle('text-on-primary', selected)
      button.classList.toggle('bg-neutral-200/50', !selected)
    })
  }

  const completePosSale = async () => {
    const orderItems = posOrderRef.current
    if (orderItems.length === 0 || !user?.id) return

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalTokens = orderItems.reduce((sum, item) => sum + item.tokens * item.quantity, 0)
    const transactionId = `SF-POS-${Date.now()}`
    const date = new Date().toLocaleString()
    const receiptItems = orderItems.flatMap((item) => Array.from({ length: item.quantity }, () => ({
      tokens: item.tokens,
      amount: item.price,
      isLoyalty: false,
    })))

    const supabase = createClient()
    const { error } = await supabase.from('token_transactions').insert({
      customer_id: null,
      employee_id: user.id,
      amount_paid: totalAmount,
      payment_type: posPaymentMethodRef.current,
      tokens_given: totalTokens,
      is_loyalty_bonus: false,
      notes: JSON.stringify({
        transactionId,
        items: orderItems,
      }),
    })

    if (error) {
      console.log('Unable to save token transaction', error)
    }

    const pdf = generateTokenReceipt({
      transactionId,
      date,
      items: receiptItems,
      totalAmount,
      totalTokens,
      paymentType: posPaymentMethodRef.current,
      customerName: 'Guest Player',
    })

    pdf.save(`${transactionId}.pdf`)

    const shouldEmail = window.confirm('Download receipt created. Would you like to email a copy too?')
    if (shouldEmail) {
      const email = window.prompt('Enter receipt email address')
      if (email) {
        const dataUri = pdf.output('datauristring')
        const pdfBase64 = dataUri.split(',')[1]

        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'token-receipt',
            to: email,
            data: {
              transactionId,
              date,
              items: receiptItems,
              totalAmount,
              totalTokens,
              paymentType: posPaymentMethodRef.current,
              customerName: 'Guest Player',
            },
            pdfBase64,
            pdfFilename: `${transactionId}.pdf`,
          }),
        })
      }
    }

    posOrderRef.current = []
    posSelectedPackRef.current = null
    renderPosSelectionState()
    renderPosReceipt()

    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc) {
      const transactionElement = getPosTransactionElement(iframeDoc)
      if (transactionElement) {
        transactionElement.textContent = `Transaction ID: ${transactionId}`
      }
    }
  }

  const enhancePosSales = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    const packageButtons = getPosPackageButtons(iframeDoc)

    packageButtons.forEach((button, index) => {
      const price = TOKEN_PRICING[index]
      if (!price) return

      button.onclick = () => {
        posSelectedPackRef.current = index
        const existing = posOrderRef.current.find((item) => item.price === price.price)
        if (existing) {
          existing.quantity += 1
        } else {
          posOrderRef.current.push({
            id: crypto.randomUUID(),
            price: price.price,
            tokens: price.tokens,
            label: `$${price.price} Value Pack`,
            quantity: 1,
          })
        }

        renderPosSelectionState()
        renderPosReceipt()
      }
    })

    const deleteButton = iframeDoc.querySelector('div.p-8.border-b button') as HTMLButtonElement | null

    if (deleteButton) {
      deleteButton.onclick = () => {
        posOrderRef.current = []
        posSelectedPackRef.current = null
        renderPosSelectionState()
        renderPosReceipt()
      }
    }

    const paymentButtons = getPosPaymentButtons(iframeDoc)

    paymentButtons.forEach((button) => {
      button.onclick = () => {
        posPaymentMethodRef.current = (button.textContent || '').toLowerCase().trim() as PaymentMethod
        renderPosSelectionState()
      }
    })

    const completeButton = Array.from(iframeDoc.querySelectorAll('button')).find((button) => {
      return (button.textContent || '').toLowerCase().includes('complete sale')
    }) as HTMLButtonElement | undefined

    if (completeButton) {
      completeButton.onclick = () => {
        void completePosSale()
      }
    }

    renderPosSelectionState()
    renderPosReceipt()
  }

  const personalizeIframe = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) return

      // Replace any remaining Google-hosted person photos (not logos — those are baked in the HTML)
      const allImages = iframeDoc.querySelectorAll('img')
      allImages.forEach((img) => {
        const src = (img as HTMLImageElement).src || ''
        const alt = (img as HTMLImageElement).alt?.toLowerCase() || ''
        const isLogo = alt.includes('logo') || alt.includes('smile factory')

        if (!isLogo && (src.includes('lh3.googleusercontent.com') || src.includes('aida-public'))) {
          // Replace with a blank circle placeholder (for avatar-style images)
          const size = (img as HTMLImageElement).width || 40
          const canvas = iframeDoc.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#d1d5db'
            ctx.beginPath()
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#9ca3af'
            ctx.font = `${Math.max(10, size / 3)}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('?', size / 2, size / 2)
          }
          ;(img as HTMLImageElement).src = canvas.toDataURL()
        }
      })

      // Update user name and title consistently using data from Supabase when available.
      if (userData) {
        const walker = iframeDoc.createTreeWalker(iframeDoc.body, NodeFilter.SHOW_TEXT)
        const textNodes: Text[] = []
        let node: Node | null
        while ((node = walker.nextNode())) textNodes.push(node as Text)

        const namePatterns = ['MD Admin', 'Marcus Vane', 'John Miller', 'Admin User', 'Admin Manager']
        const rolePatterns = ['Floor Manager', 'Floor Supervisor', 'Operations Unit', 'Super Admin', 'SUPER ADMIN', 'S/FL-A-04']

        textNodes.forEach((tn) => {
          let t = tn.textContent || ''
          namePatterns.forEach((p) => { t = t.replace(p, userData.full_name || p) })
          rolePatterns.forEach((p) => { t = t.replace(p, userData.position || p) })
          if (t !== tn.textContent) tn.textContent = t
        })

      }

      const profileContainers = iframeDoc.querySelectorAll('header div.flex.items-center.gap-4, header div.flex.items-center.gap-3, header div.flex.items-center.gap-2')
      profileContainers.forEach((container) => {
        const element = container as HTMLElement
        const profileText = element.querySelector('div.text-right') as HTMLElement | null
        const nameElement = profileText?.querySelector('p:first-child') as HTMLElement | null

        if (!profileText || !nameElement) {
          return
        }

        element.style.cursor = 'default'
        element.onclick = null

        let nameRow = profileText.querySelector('[data-profile-name-row="true"]') as HTMLElement | null
        if (!nameRow) {
          nameRow = iframeDoc.createElement('div')
          nameRow.setAttribute('data-profile-name-row', 'true')
          nameRow.className = 'flex items-center justify-end gap-2'
          profileText.insertBefore(nameRow, profileText.firstChild)
          nameRow.appendChild(nameElement)
        }

        let logoutButton = nameRow.querySelector('[data-logout-icon="true"]') as HTMLButtonElement | null
        if (!logoutButton) {
          logoutButton = iframeDoc.createElement('button')
          logoutButton.type = 'button'
          logoutButton.setAttribute('data-logout-icon', 'true')
          logoutButton.setAttribute('aria-label', 'Log out and return home')
          logoutButton.className = 'inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-primary'
          logoutButton.innerHTML = '<span class="material-symbols-outlined text-[18px]" data-icon="logout">logout</span>'
          nameRow.appendChild(logoutButton)
        }

        logoutButton.onclick = () => {
          void handleLogout()
        }
      })
    } catch (err) {
      console.log('Cannot access iframe content (cross-origin)')
    }
  }

  // Mount the dashboard shell once. Section changes swap content inside this shell.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    iframe.src = `/stitch/admin/${SHELL_ROUTE_KEY}/code.html`
  }, [])

  useEffect(() => {
    if (!shellReady) return
    void loadSectionContent(activeRouteKey)
  }, [activeRouteKey, shellReady])

  // Personalize iframe after it loads.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleIframeLoad = async () => {
      setShellReady(true)
      personalizeIframe()
      setupNavigation()
      syncSidebarActiveState(activeRouteKey)
      await loadSectionContent(activeRouteKey)
    }

    iframe.addEventListener('load', handleIframeLoad)

    return () => {
      iframe.removeEventListener('load', handleIframeLoad)
    }
  }, [userData])

  const setupNavigation = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) return

      // Keep navigation inside the same mounted admin workspace.
      const links = iframeDoc.querySelectorAll('a[href="#"], a')
      links.forEach((link) => {
        const href = (link as HTMLAnchorElement).href
        if (href === '#' || href.endsWith('#')) {
          ;(link as HTMLAnchorElement).onclick = (e) => {
            e.preventDefault()
            const text = (link as HTMLElement).textContent?.toLowerCase() || ''

            for (const [key, nextRouteKey] of Object.entries(stitchLinkMap)) {
              if (text.includes(key)) {
                navigateToSection(nextRouteKey)
                return
              }
            }
          }
        }
      })
    } catch (err) {
      console.log('Cannot access iframe content (cross-origin)')
    }
  }

  return (
    <iframe
      ref={iframeRef}
      src={`/stitch/admin/${SHELL_ROUTE_KEY}/code.html`}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
      title={`Page: ${activeRouteKey}`}
    />
  )
}
