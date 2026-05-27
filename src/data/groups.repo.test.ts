import { vi, describe, it, expect, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGroupMember = {
  update: vi.fn(),
  delete: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
}
const mockGroup = {
  create: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
}
const mockGuestMember = {
  create: vi.fn(),
  findUnique: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    groupMember: mockGroupMember,
    group: mockGroup,
    guestMember: mockGuestMember,
    user: { findMany: vi.fn(), findUnique: vi.fn() },
    expense: { findMany: vi.fn() },
  },
}))

// Unwrap cache wrappers so we test the real logic, not the cache boundary
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, cache: (fn: unknown) => fn }
})

vi.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
}))

// ── Subject under test ─────────────────────────────────────────────────────

// Import AFTER mocks are set up
const { groupsRepo } = await import('./groups.repo')

// ── Tests ──────────────────────────────────────────────────────────────────

const GID = 'group-1'
const UID = 'user-1'
const UID2 = 'user-2'

describe('groupsRepo.acceptInvite', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates status to ACTIVE and sets joinedAt', async () => {
    mockGroupMember.update.mockResolvedValueOnce({ groupId: GID, userId: UID, status: 'ACTIVE' })
    await groupsRepo.acceptInvite(GID, UID)
    expect(mockGroupMember.update).toHaveBeenCalledWith({
      where: { groupId_userId: { groupId: GID, userId: UID } },
      data: expect.objectContaining({ status: 'ACTIVE', joinedAt: expect.any(Date) }),
    })
  })

  it('propagates errors from Prisma', async () => {
    mockGroupMember.update.mockRejectedValueOnce(new Error('Record not found'))
    await expect(groupsRepo.acceptInvite(GID, UID)).rejects.toThrow('Record not found')
  })
})

describe('groupsRepo.rejectInvite', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes the GroupMember record', async () => {
    mockGroupMember.delete.mockResolvedValueOnce({ groupId: GID, userId: UID })
    await groupsRepo.rejectInvite(GID, UID)
    expect(mockGroupMember.delete).toHaveBeenCalledWith({
      where: { groupId_userId: { groupId: GID, userId: UID } },
    })
  })

  it('propagates errors if record does not exist', async () => {
    mockGroupMember.delete.mockRejectedValueOnce(new Error('No record'))
    await expect(groupsRepo.rejectInvite(GID, UID)).rejects.toThrow('No record')
  })
})

describe('groupsRepo.requireActiveMembership', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves when member is ACTIVE', async () => {
    mockGroupMember.findUnique.mockResolvedValueOnce({ status: 'ACTIVE' })
    await expect(groupsRepo.requireActiveMembership(GID, UID)).resolves.toBeUndefined()
  })

  it('throws when member is PENDING (not yet accepted)', async () => {
    mockGroupMember.findUnique.mockResolvedValueOnce({ status: 'PENDING' })
    await expect(groupsRepo.requireActiveMembership(GID, UID)).rejects.toThrow()
  })

  it('throws when member record does not exist', async () => {
    mockGroupMember.findUnique.mockResolvedValueOnce(null)
    await expect(groupsRepo.requireActiveMembership(GID, UID)).rejects.toThrow()
  })
})

describe('groupsRepo.inviteMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a PENDING invite when no prior record exists', async () => {
    mockGroupMember.upsert.mockResolvedValueOnce({ groupId: GID, userId: UID2, status: 'PENDING' })
    await groupsRepo.inviteMember(GID, UID2, UID)
    expect(mockGroupMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: 'PENDING', invitedBy: UID }),
      }),
    )
  })

  it('does not overwrite an existing record (update: {})', async () => {
    mockGroupMember.upsert.mockResolvedValueOnce({ groupId: GID, userId: UID2, status: 'ACTIVE' })
    await groupsRepo.inviteMember(GID, UID2, UID)
    expect(mockGroupMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: {} }),
    )
  })
})
