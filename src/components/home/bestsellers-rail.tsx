'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { AdminProduct } from '@/lib/admin/constants';
import { formatPrice, discountPercent } from '@/lib/format';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';

type Props = { products: AdminProduct[] };

export function BestsellersRail({ products }: Props) {
  const railRef = useRef<HTMLUListElement>(null);
  const addLine = useCartStore((state) => state.addLine);

  function scrollRail(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector('li');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 20 : 320;
    const cardsToScroll = rail.clientWidth > 900 ? 2 : 1;
    rail.scrollBy({ left: direction * cardWidth * cardsToScroll, behavior: 'smooth' });
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full max-w-full overflow-hidden bg-ivory-200/60 py-18 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Most loved"
            title="Bestsellers"
            description="The pieces our clients return for — and the ones they photograph the most."
          />

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => scrollRail(-1)}
                aria-label="Previous products"
                className="bg-card"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => scrollRail(1)}
                aria-label="Next products"
                className="bg-card"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <Button asChild variant="link" className="gap-2 px-0">
              <Link href="/shop">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <ul
          ref={railRef}
          className="no-scrollbar mt-11 flex w-full max-w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1"
        >
          {products.map((product) => {
            const image = product.image_urls?.[0] ?? null;
            const discount = discountPercent(product.price, product.compare_at_price ?? undefined);

            return (
              <li
                key={product.id}
                className="flex shrink-0 snap-start w-[68vw] sm:w-[46vw] md:w-[31vw] lg:w-[23vw] xl:w-[19rem]"
              >
                <article className="group flex h-full flex-col w-full">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative block aspect-3/4 shrink-0 overflow-hidden rounded-lg bg-ivory-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={product.title}
                        fill
                        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 68vw"
                        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-ivory-300 text-ink-300 text-sm">
                        No image
                      </div>
                    )}
                    <span className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                      {discount > 0 ? <Badge variant="magenta">−{discount}%</Badge> : null}
                      {product.is_made_to_order ? <Badge variant="gold">Made to order</Badge> : null}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col pt-4">
                    <h3 className="line-clamp-2 min-h-[2.75em] font-serif text-lg leading-snug">
                      <Link
                        href={`/product/${product.slug}`}
                        className="transition-colors hover:text-gold-700"
                      >
                        {product.title}
                      </Link>
                    </h3>
                    {product.subtitle ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{product.subtitle}</p>
                    ) : null}

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-base font-medium tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_at_price ? (
                        <span className="text-sm text-ink-300 line-through tabular-nums">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-auto pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addLine({
                            productId: product.id,
                            slug: product.slug,
                            title: product.title,
                            image: image ?? '',
                            price: product.price,
                            size: null,
                            color: null,
                            quantity: 1,
                            madeToMeasure: false,
                            measurements: null,
                            referenceFiles: [],
                            notes: '',
                          })
                        }
                        className="w-full border-ink-200 text-xs tracking-[0.12em] uppercase hover:border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
